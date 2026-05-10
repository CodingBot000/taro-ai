# Licenses And Source Attribution

## Application Code

- `backend`: project application code.
- `frontend/tarot-project`: project application code.
- `huggingface_space`: project inference and Gradio application code.

Add the final repository license before public submission.

## Model

- Hugging Face model id used by the Space: `AutoBot000/tarot-qwen2.5-7b-v31`.
- Base model and fine-tuning dataset license should be verified before public portfolio submission.

## Card Image

- Frontend card-back asset: `frontend/tarot-project/public/cards/CardBacks.jpg`.
- Source and usage license must be verified before public portfolio submission.

## Training Data

- Local directories named `taro_pretrained_files*` are treated as generated/intermediate training artifacts and are excluded from the public root `.gitignore`.
- If the dataset is part of the portfolio story, publish it separately with an explicit license or replace it with a sample dataset.

## Third-Party Libraries

- Backend dependencies are resolved from Maven Central through Gradle.
- Frontend dependencies are resolved from npm and locked by `package-lock.json`.
- Hugging Face Space dependencies are pinned in `huggingface_space/requirements.txt`.
