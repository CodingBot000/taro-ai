#!/usr/bin/env python3
"""Manual smoke runner for local question-analysis E2E checks.

This script calls the local Spring endpoint and then inspects the latest
question-analysis log line from the dockerized backend to verify whether the
request used OpenAI or fell back.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_API_BASE_URL = os.environ.get("SMOKE_API_BASE_URL", "http://localhost:8080")
DEFAULT_COMPOSE_FILE = os.environ.get("SMOKE_COMPOSE_FILE", "compose.app.yml")
DEFAULT_ORIGIN = os.environ.get("SMOKE_ORIGIN", "http://localhost:3100")
DEFAULT_POLL_SECONDS = 20.0
DEFAULT_UI_CONTEXT = {"locale": "ko", "categoryVersion": "category-v1"}

ONE_CARD_SELECTION = [
    {"id": "major_01", "direction": "정방향"},
]

THREE_CARD_SELECTION = [
    {"id": "major_01", "direction": "정방향"},
    {"id": "major_02", "direction": "역방향"},
    {"id": "major_03", "direction": "정방향"},
]

ANALYSIS_LOG_PATTERN = re.compile(
    r"Question analysis completed\. source=(?P<source>[^,]+), "
    r"domain=(?P<domain>[^,]+), subtype=(?P<subtype>[^,]+), "
    r"primaryIntent=(?P<primary_intent>[^,]+), secondaryIntents=(?P<secondary_intents>\[[^\]]*\]), "
    r"confidence=(?P<confidence>[^,]+), "
    r"needsClarification=(?P<needs_clarification>\S+)"
)

FALLBACK_LOG_PATTERNS = (
    "Question analysis failed. Falling back to UI-derived defaults.",
    "Question analysis timed out. Falling back to UI-derived defaults.",
    "Question analysis interrupted. Falling back to UI-derived defaults.",
    "Unsupported question analysis provider:",
    "Question analysis provider is blank.",
)


@dataclass(frozen=True)
class SmokeCase:
    case_id: str
    question: str
    main_category: str
    sub_category: str
    reading_type: str = "one-card"
    expected_domains: tuple[str, ...] = ()
    expected_subtypes: tuple[str, ...] = ()
    expected_primary_intents: tuple[str, ...] = ()
    expected_needs_clarification: bool | None = None
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


REPRESENTATIVE_CASES: tuple[SmokeCase, ...] = (
    SmokeCase(
        case_id="love-reunion-aligned",
        question="전남친이 왜 그렇게 차갑게 끝냈는지, 다시 연락할 가능성이 있는지 궁금해요.",
        main_category="love",
        sub_category="reunion",
        expected_domains=("love",),
        expected_subtypes=("reunion", "after_breakup"),
        expected_primary_intents=("cause",),
        expected_needs_clarification=False,
        notes="md 샘플 1",
    ),
    SmokeCase(
        case_id="career-job-change-aligned",
        question="이 회사에 계속 남아야 할지, 이직해야 할지 고민돼요.",
        main_category="career",
        sub_category="job_change",
        expected_domains=("career",),
        expected_subtypes=("job_change",),
        expected_primary_intents=("comparison",),
        expected_needs_clarification=False,
        notes="md 샘플 2",
    ),
    SmokeCase(
        case_id="finance-investment-aligned",
        question="투자를 시작해도 될까요, 아니면 지금은 보류해야 할까요?",
        main_category="finance",
        sub_category="investment",
        expected_domains=("finance",),
        expected_subtypes=("investment",),
        expected_primary_intents=("comparison", "advice"),
        expected_needs_clarification=False,
        notes="md 샘플 3",
    ),
    SmokeCase(
        case_id="relationship-distance-aligned",
        question="친구와 멀어진 이유가 뭘까요? 다시 가까워질 수 있을까요?",
        main_category="relationship",
        sub_category="distance_conflict",
        expected_domains=("relationship",),
        expected_subtypes=("distance_conflict", "reconciliation"),
        expected_primary_intents=("cause", "possibility"),
        expected_needs_clarification=False,
        notes="md 샘플 4",
    ),
    SmokeCase(
        case_id="study-exam-aligned",
        question="시험 결과가 언제쯤 윤곽이 보일까요?",
        main_category="study",
        sub_category="exam_result",
        expected_domains=("study",),
        expected_subtypes=("exam_result",),
        expected_primary_intents=("timing",),
        expected_needs_clarification=False,
        notes="md 샘플 5",
    ),
    SmokeCase(
        case_id="general-ambiguous-aligned",
        question="어떻게 될까요?",
        main_category="general",
        sub_category="overall_flow",
        expected_domains=("general",),
        expected_subtypes=("overall_flow", "unknown"),
        expected_primary_intents=("overall_guidance", "future_flow"),
        expected_needs_clarification=True,
        notes="md 샘플 6",
    ),
)

CONFLICT_CASES: tuple[SmokeCase, ...] = (
    SmokeCase(
        case_id="career-question-ui-love",
        question="이 회사에 계속 남아야 할지, 이직해야 할지 고민돼요.",
        main_category="love",
        sub_category="reunion",
        expected_domains=("career",),
        expected_subtypes=("job_change",),
        expected_primary_intents=("comparison",),
        expected_needs_clarification=False,
        notes="질문이 UI보다 우선인지 확인",
    ),
    SmokeCase(
        case_id="finance-question-ui-career",
        question="투자를 시작해도 될까요, 아니면 지금은 보류해야 할까요?",
        main_category="career",
        sub_category="job_change",
        expected_domains=("finance",),
        expected_subtypes=("investment",),
        expected_primary_intents=("comparison", "advice"),
        expected_needs_clarification=False,
        notes="질문이 UI보다 우선인지 확인",
    ),
    SmokeCase(
        case_id="relationship-question-ui-study",
        question="친구와 멀어진 이유가 뭘까요? 다시 가까워질 수 있을까요?",
        main_category="study",
        sub_category="exam_result",
        expected_domains=("relationship",),
        expected_subtypes=("distance_conflict", "reconciliation"),
        expected_primary_intents=("cause", "possibility"),
        expected_needs_clarification=False,
        notes="질문이 UI보다 우선인지 확인",
    ),
    SmokeCase(
        case_id="study-question-ui-general",
        question="시험 결과가 언제쯤 윤곽이 보일까요?",
        main_category="general",
        sub_category="today",
        expected_domains=("study",),
        expected_subtypes=("exam_result",),
        expected_primary_intents=("timing",),
        expected_needs_clarification=False,
        notes="질문이 UI보다 우선인지 확인",
    ),
    SmokeCase(
        case_id="general-question-ui-finance",
        question="이번 달 전체 흐름이 어떻게 갈지 궁금해요.",
        main_category="finance",
        sub_category="investment",
        expected_domains=("general",),
        expected_subtypes=("week_month", "overall_flow"),
        expected_primary_intents=("future_flow", "overall_guidance"),
        expected_needs_clarification=False,
        notes="질문이 UI보다 우선인지 확인",
    ),
    SmokeCase(
        case_id="ambiguous-question-ui-specific",
        question="어떻게 될까요?",
        main_category="study",
        sub_category="exam_result",
        expected_domains=("general", "study"),
        expected_subtypes=("unknown", "exam_result"),
        expected_primary_intents=("overall_guidance", "future_flow"),
        expected_needs_clarification=True,
        notes="모호한 질문에서 보수적으로 분류하는지 확인",
    ),
)

ALL_CASES: tuple[SmokeCase, ...] = REPRESENTATIVE_CASES + CONFLICT_CASES
CASE_MAP = {case.case_id: case for case in ALL_CASES}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run live question-analysis smoke checks against the local backend."
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
    parser.add_argument("--compose-file", default=DEFAULT_COMPOSE_FILE)
    parser.add_argument("--origin", default=DEFAULT_ORIGIN)
    parser.add_argument("--poll-seconds", type=float, default=DEFAULT_POLL_SECONDS)
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


def list_cases(cases: Iterable[SmokeCase]) -> None:
    for case in cases:
        print(f"{case.case_id:28} {case.main_category}/{case.sub_category}  {case.notes}")


def load_custom_case(args: argparse.Namespace) -> SmokeCase | None:
    if not args.question:
        return None
    if not args.main_category or not args.sub_category:
        raise SystemExit("--question with a custom run requires --main-category and --sub-category.")
    return SmokeCase(
        case_id="custom",
        question=args.question,
        main_category=args.main_category,
        sub_category=args.sub_category,
        reading_type=args.reading_type,
        notes="custom",
    )


def run_docker_logs(compose_file: str) -> list[str]:
    command = [
        "docker",
        "compose",
        "-f",
        compose_file,
        "logs",
        "--tail",
        "200",
        "spring-service",
    ]
    completed = subprocess.run(
        command,
        cwd=BACKEND_DIR,
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(completed.stderr.strip() or "docker compose logs failed")
    return completed.stdout.splitlines()


def latest_analysis_line(compose_file: str) -> str | None:
    lines = run_docker_logs(compose_file)
    matches = [line for line in lines if "Question analysis " in line]
    return matches[-1] if matches else None


def wait_for_new_analysis_line(compose_file: str, previous_line: str | None, poll_seconds: float) -> str | None:
    deadline = time.time() + poll_seconds
    while time.time() < deadline:
        current = latest_analysis_line(compose_file)
        if current and current != previous_line:
            return current
        time.sleep(1.0)
    return None


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
        with urllib.request.urlopen(request, timeout=180) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return error.code, parsed


def parse_analysis_line(line: str | None) -> dict[str, str] | None:
    if not line:
        return None
    match = ANALYSIS_LOG_PATTERN.search(line)
    if match:
        return match.groupdict()
    for pattern in FALLBACK_LOG_PATTERNS:
        if pattern in line:
            return {"fallback_log": line.strip()}
    return {"unparsed_log": line.strip()}


def evaluate_case(case: SmokeCase, analysis: dict[str, str] | None) -> list[str]:
    failures: list[str] = []
    if analysis is None:
        return ["analysis log not found"]
    if "fallback_log" in analysis:
        return [analysis["fallback_log"]]
    if analysis.get("source") != "openai":
        failures.append(f"source={analysis.get('source')}")
    if case.expected_domains and analysis.get("domain") not in case.expected_domains:
        failures.append(f"domain={analysis.get('domain')}, expected one of {case.expected_domains}")
    if case.expected_subtypes and analysis.get("subtype") not in case.expected_subtypes:
        failures.append(f"subtype={analysis.get('subtype')}, expected one of {case.expected_subtypes}")
    if case.expected_primary_intents and analysis.get("primary_intent") not in case.expected_primary_intents:
        failures.append(
            f"primaryIntent={analysis.get('primary_intent')}, expected one of {case.expected_primary_intents}"
        )
    if case.expected_needs_clarification is not None:
        actual = (analysis.get("needs_clarification") or "").lower() == "true"
        if actual != case.expected_needs_clarification:
            failures.append(
                f"needsClarification={analysis.get('needs_clarification')}, expected {case.expected_needs_clarification}"
            )
    return failures


def response_preview(response_payload: dict[str, object]) -> str:
    text = str(response_payload.get("interpretation") or response_payload.get("error") or response_payload.get("raw") or "")
    text = text.replace("\n", " ").strip()
    return text[:120] + ("..." if len(text) > 120 else "")


def print_case_header(index: int, total: int, case: SmokeCase) -> None:
    print(f"[{index}/{total}] {case.case_id}")
    print(f"UI: {case.main_category}/{case.sub_category} | readingType={case.reading_type}")
    print(f"Q: {case.question}")
    if case.notes:
        print(f"Note: {case.notes}")


def print_analysis_summary(analysis_line: str | None, analysis: dict[str, str] | None) -> None:
    if analysis is None:
        print("Analysis: <not found>")
        return
    if "fallback_log" in analysis:
        print(f"Analysis: FALLBACK | {analysis['fallback_log']}")
        return
    if "unparsed_log" in analysis:
        print(f"Analysis: {analysis['unparsed_log']}")
        return
    print(
        "Analysis: "
        f"source={analysis['source']} "
        f"domain={analysis['domain']} "
        f"subtype={analysis['subtype']} "
        f"primaryIntent={analysis['primary_intent']} "
        f"secondaryIntents={analysis['secondary_intents']} "
        f"confidence={analysis['confidence']} "
        f"needsClarification={analysis['needs_clarification']}"
    )
    if analysis_line:
        print(f"Log: {analysis_line}")


def main() -> int:
    args = parse_args()

    if args.list:
        list_cases(ALL_CASES)
        return 0

    custom_case = load_custom_case(args)
    if custom_case:
        cases = [custom_case]
    elif args.all:
        cases = list(ALL_CASES)
    elif args.cases:
        missing = [case_id for case_id in args.cases if case_id not in CASE_MAP]
        if missing:
            raise SystemExit(f"Unknown case IDs: {', '.join(missing)}")
        cases = [CASE_MAP[case_id] for case_id in args.cases]
    else:
        cases = list(REPRESENTATIVE_CASES)

    failures_total = 0

    for index, case in enumerate(cases, start=1):
        print_case_header(index, len(cases), case)
        before_line = latest_analysis_line(args.compose_file)
        status_code, response_payload = post_tarot_request(args.api_base_url, case.request_payload(), args.origin)
        after_line = wait_for_new_analysis_line(args.compose_file, before_line, args.poll_seconds)
        analysis = parse_analysis_line(after_line)
        failures = evaluate_case(case, analysis)

        print(f"HTTP: {status_code}")
        if status_code >= 400:
            failures.insert(0, f"http_status={status_code}")
        print_analysis_summary(after_line, analysis)
        print(f"Response: {response_preview(response_payload)}")

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
