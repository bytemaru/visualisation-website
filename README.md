# 🌊 NZ Lake Water Quality Visualization (2016–2020)

This project is an interactive information visualization system that enables users to explore water quality data in New Zealand lakes from 2016 to 2020.

Built with **D3.js** for the frontend and **Flask (Python)** for data handling, the goal is to help users uncover patterns and trends in key indicators such as nutrient concentrations, trophic levels, and water clarity.

---

## 🔍 Features

- 📈 Line charts to explore temporal trends in water quality
- 🗺️ Interactive map of lakes colored by water health index
- 📊 Bar or bubble charts comparing nutrient levels across regions
- 🧭 Hover, filter, and tooltip interactivity for deep exploration

---

## 📁 Dataset

**Source**: [Lake Water Quality, State, 2016 - 2020](https://catalogue.data.govt.nz/dataset/lake-water-quality-state-2016-2020)  
Provided by the Ministry for the Environment (MfE), New Zealand.

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://gitlab.ecs.vuw.ac.nz/course-work/swen422/2025/assignment1/team11/water_quality/
cd water_quality
```

### 2. Create virtual environment and install dependencies
```bash
python -m venv venv
source venv/bin/activate     
pip install -r requirements.txt
```