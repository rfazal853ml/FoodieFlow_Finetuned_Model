# 🍽️ AI Meal Planner

An intelligent meal planning application powered by a fine-tuned machine learning model. This app generates personalized meal plans based on user preferences, dietary restrictions, and nutritional goals.

## 🚀 Features
### 🤖 AI-Powered Meal Planning
Uses a fine-tuned model to generate tailored meal recommendations.
### 🥗 Custom Dietary Preferences
Supports vegetarian, vegan, keto, and other diet types.
### ⚖️ Nutritional Awareness
Meals can be optimized for calories, macros, or health goals.
### 📅 Weekly Planning
Generate full weekly meal schedules in seconds.
### 🛒 Shopping List Generation
Automatically creates grocery lists based on selected meals.

## 🧠 Model

This project leverages a fine-tuned language model trained on curated meal and nutrition datasets. The model is optimized to:

Understand dietary constraints
Suggest balanced meals
Provide diverse cuisine options

## 🏗️ Tech Stack
Frontend: (Jinja Template)
Backend: (FastAPI)
Model Serving: (Own Fine tuned model local inference)


## 📦 Installation
bash
```
git clone https://github.com/rfazal853ml/FoodieFlow_FineTuned_Model
cd FoodieFlow_Finetuned_Model
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

## ⚙️ Environment Variables

Create a .env file in the root directory:

bash
```
API_KEY=your_api_key_here
MODEL_NAME=your_finetuned_model
```

## ▶️ Running the App
bash
```
python main.py
```

## 🧪 Future Improvements
User authentication & profiles
Meal rating & feedback loop
Macro tracking dashboard
Mobile app support
🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### 📄 License
This project is licensed under the MIT License.