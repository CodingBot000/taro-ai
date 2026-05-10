#!/usr/bin/env python3
"""Manual smoke runner for live HF response-quality checks via the local backend."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
HF_SPACE_DIR = ROOT_DIR / "huggingface_space"
sys.path.insert(0, str(HF_SPACE_DIR))

from response_quality import find_output_quality_issues
from response_quality import sentence_count


DEFAULT_API_BASE_URL = os.environ.get("SMOKE_API_BASE_URL", "http://localhost:8080")
DEFAULT_ORIGIN = os.environ.get("SMOKE_ORIGIN", "http://localhost:3100")
DEFAULT_UI_CONTEXT = {"locale": "ko", "categoryVersion": "category-v1"}

ONE_CARD_SELECTION = [
    {"id": "major_01", "direction": "정방향"},
]

THREE_CARD_SELECTION = [
    {"id": "major_01", "direction": "정방향"},
    {"id": "major_02", "direction": "역방향"},
    {"id": "major_03", "direction": "정방향"},
]


@dataclass(frozen=True)
class ResponseQualityCase:
    case_id: str
    question: str
    main_category: str
    sub_category: str
    reading_type: str
    notes: str = ""

    def selected_cards_json(self) -> str:
        cards = ONE_CARD_SELECTION if self.reading_type == "one-card" else THREE_CARD_SELECTION
        return json.dumps(cards, ensure_ascii=False)

    def request_payload(self) -> dict[str, object]:
        return {
            "question": self.question,
            "readingType": self.reading_type,
            "selectedCardsJson": self.selected_cards_json(),
            "categorySelection": {
                "mainCategoryId": self.main_category,
                "subCategoryId": self.sub_category,
            },
            "uiContext": DEFAULT_UI_CONTEXT,
        }

    @property
    def normalized_reading_type(self) -> str:
        return "원카드" if self.reading_type == "one-card" else "쓰리카드"


REPRESENTATIVE_CASES: tuple[ResponseQualityCase, ...] = (
    ResponseQualityCase(
        case_id="one-love-reunion",
        question="전남친이 왜 그렇게 차갑게 끝냈는지, 다시 연락할 가능성이 있는지 궁금해요.",
        main_category="love",
        sub_category="reunion",
        reading_type="one-card",
        notes="원카드 연애 재회 질문",
    ),
    ResponseQualityCase(
        case_id="one-career-job-change",
        question="이 회사에 계속 남아야 할지, 이직해야 할지 고민돼요.",
        main_category="career",
        sub_category="job_change",
        reading_type="one-card",
        notes="원카드 커리어 비교 질문",
    ),
    ResponseQualityCase(
        case_id="three-finance-investment",
        question="투자를 시작해도 될까요, 아니면 지금은 보류해야 할까요?",
        main_category="finance",
        sub_category="investment",
        reading_type="three-card",
        notes="쓰리카드 투자 판단 질문",
    ),
    ResponseQualityCase(
        case_id="three-relationship-distance",
        question="친구와 멀어진 이유가 뭘까요? 다시 가까워질 수 있을까요?",
        main_category="relationship",
        sub_category="distance_conflict",
        reading_type="three-card",
        notes="쓰리카드 관계 회복 질문",
    ),
    ResponseQualityCase(
        case_id="one-general-overall-flow",
        question="이번 주 전체 흐름이 어떻게 갈지 궁금해요.",
        main_category="general",
        sub_category="week_month",
        reading_type="one-card",
        notes="원카드 일반 흐름 질문",
    ),
)

CASE_MAP = {case.case_id: case for case in REPRESENTATIVE_CASES}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run live HF response-quality smoke checks against the local backend."
    )
    parser.add_argument("--list", action="store_true", help="List built-in smoke cases and exit.")
    parser.add_argument("--all", action="store_true", help="Run all built-in smoke cases.")
    parser.add_argument(
        "--case",
        action="append",
        dest="cases",
        default=[],
        help="Run one or more built-in case IDs.",
    )
    parser.add_argument("--api-base-url", default=DEFAULT_API_BASE_URL)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    parser.add_argument("--show-full", action="store_true", help="Print the full interpretation.")
    parser.add_argument("--question", help="Run a custom question instead of a built-in case.")
    parser.add_argument("--main-category", help="Custom case main category.")
    parser.add_argument("--sub-category", help="Custom case sub category.")
    parser.add_argument(
        "--reading-type",
        choices=("one-card", "three-card"),
        default="one-card",
        help="Custom case reading type.",
    )
    return parser.parse_args()


def list_cases(cases: tuple[ResponseQualityCase, ...]) -> None:
    for case in cases:
        print(f"{case.case_id:28} {case.reading_type:10} {case.main_category}/{case.sub_category}  {case.notes}")


def load_custom_case(args: argparse.Namespace) -> ResponseQualityCase | None:
    if not args.question:
        return None
    if not args.main_category or not args.sub_category:
        raise SystemExit("--question with a custom run requires --main-category and --sub-category.")
    return ResponseQualityCase(
        case_id="custom",
        question=args.question,
        main_category=args.main_category,
        sub_category=args.sub_category,
        reading_type=args.reading_type,
        notes="custom",
    )


def post_tarot_request(api_base_url: str, payload: dict[str, object], origin: str) -> tuple[int, dict[str, object]]:
    request = urllib.request.Request(
        url=f"{api_base_url.rstrip('/')}/api/tarot",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Origin": origin,
            "Referer": f"{origin.rstrip('/')}/",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=240) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return error.code, parsed


def response_preview(text: str) -> str:
    compact = re.sub(r"\s+", " ", text).strip()
    return compact[:160] + ("..." if len(compact) > 160 else "")

def evaluate_case(case: ResponseQualityCase, response_payload: dict[str, object]) -> tuple[list[str], str]:
    failures: list[str] = []
    interpretation = str(response_payload.get("interpretation") or "").strip()
    error_message = str(response_payload.get("error") or "").strip()

    if error_message:
        return [f"error={error_message}"], interpretation

    if not interpretation:
        return ["missing_interpretation"], interpretation

    issues = find_output_quality_issues(interpretation, case.normalized_reading_type)
    failures.extend(issues)

    return failures, interpretation


def main() -> int:
    args = parse_args()

    if args.list:
        list_cases(REPRESENTATIVE_CASES)
        return 0

    custom_case = load_custom_case(args)
    if custom_case:
        cases = [custom_case]
    elif args.all:
        cases = list(REPRESENTATIVE_CASES)
    elif args.cases:
        missing = [case_id for case_id in args.cases if case_id not in CASE_MAP]
        if missing:
            raise SystemExit(f"Unknown case IDs: {', '.join(missing)}")
        cases = [CASE_MAP[case_id] for case_id in args.cases]
    else:
        cases = list(REPRESENTATIVE_CASES)

    failures_total = 0

    for index, case in enumerate(cases, start=1):
        print(f"[{index}/{len(cases)}] {case.case_id}")
        print(f"UI: {case.main_category}/{case.sub_category} | readingType={case.reading_type}")
        print(f"Q: {case.question}")
        if case.notes:
            print(f"Note: {case.notes}")

        status_code, response_payload = post_tarot_request(args.api_base_url, case.request_payload(), args.origin)
        failures, interpretation = evaluate_case(case, response_payload)

        print(f"HTTP: {status_code}")
        if status_code >= 400:
            failures.insert(0, f"http_status={status_code}")

        if interpretation:
            compact_char_count = len(re.sub(r"\s+", "", interpretation))
            interpretation_sentence_count = sentence_count(interpretation)
            print(f"Chars: {compact_char_count}")
            print(f"Sentences: {interpretation_sentence_count}")
            print(f"Preview: {response_preview(interpretation)}")
            if args.show_full:
                print("Full:")
                print(interpretation)
        else:
            raw = str(response_payload.get("error") or response_payload.get("raw") or "").strip()
            print(f"Preview: {response_preview(raw)}")

        if failures:
            failures_total += 1
            print("Result: FAIL")
            for failure in failures:
                print(f"  - {failure}")
        else:
            print("Result: PASS")

        print()

    if failures_total:
        print(f"Finished with {failures_total} failing case(s).")
        return 1

    print("Finished with all cases passing.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        raise SystemExit(130)
