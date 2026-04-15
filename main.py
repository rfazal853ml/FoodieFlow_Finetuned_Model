from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from unsloth import FastLanguageModel
import torch
import json

app = FastAPI(title="FoodieFlow")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

SYSTEM_PROMPT = """You are a meal planning assistant.

You MUST respond with valid JSON only. Do not include any explanation, text, or formatting outside JSON.

Your response must be a single JSON object with this structure:

{
  "meal_plan": [
    {
      "day": 1,
      "breakfast": {
        "name": "",
        "prep_time_min": 0,
        "difficulty": "easy",
        "servings": 1,
        "calories_kcal": 0,
        "protein_g": 0
      },
      "lunch": { "name": "", "prep_time_min": 0, "difficulty": "easy", "servings": 1, "calories_kcal": 0, "protein_g": 0 },
      "dinner": { "name": "", "prep_time_min": 0, "difficulty": "easy", "servings": 1, "calories_kcal": 0, "protein_g": 0 },
      "snack": { "name": "", "prep_time_min": 0, "difficulty": "easy", "servings": 1, "calories_kcal": 0, "protein_g": 0 }
    }
  ]
}

Rules:
- "meal_plan" must be an array of day objects
- Number of days must match the user's request
- Day numbers must be sequential starting from 1
- Do NOT include ellipsis (...) or placeholders
- Do NOT omit any fields
- Output must be valid JSON parsable by standard JSON parsers
- Every bracket must open and close properly"""

model = None
tokenizer = None

@app.on_event("startup")
async def load_model():
    global model, tokenizer
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name="Llama-3.2-3B-Instruct",
        max_seq_length=2048,
        load_in_4bit=False,
    )
    tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "left"
    FastLanguageModel.for_inference(model)
    print("✅ Model loaded and ready.")


# --------------- Routes ---------------
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/generate")
async def generate(
    country: str = Form(...),
    goal: str = Form(...),
    diet: str = Form(...),
    days: int = Form(...),
):
    user_message = (
        f"Generate a {days}-day meal plan based on {country} cuisine and {goal} goal.\n"
        f"Country: {country}\nFitness goal: {goal}\nDiet: {diet}"
    )


    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message},
    ]

    inputs = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt",
        padding=True,
    ).to("cuda")

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs,
            max_new_tokens=2048,
            temperature=0.1,
            do_sample=True,
        )

    generated = tokenizer.decode(
        outputs[0][inputs.shape[1]:], skip_special_tokens=True
    )

    # Strip markdown fences if present
    clean = generated.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
        clean = clean.strip()

    try:
        data = json.loads(clean)
        return JSONResponse(content=data)
    except json.JSONDecodeError:
        return JSONResponse(
            status_code=422,
            content={"error": "Model returned invalid JSON. Please try again."},
        )