# 🕉️ Sanātana Dharma LLM - AI-Powered Spiritual Knowledge Assistant

![Project Status](https://img.shields.io/badge/Status-MVP%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Python](https://img.shields.io/badge/Python-3.8%2B-brightgreen)

> **Bringing ancient wisdom to modern learners through AI**

An intelligent chatbot powered by fine-tuned language models, trained on the Bhagavad-Gītā and other sacred texts of Sanātana Dharma. Designed to make spiritual wisdom accessible to everyone, from children to scholars.

---

## 📖 **Overview**

The Sanātana Dharma LLM project aims to create an AI assistant that can:
- Answer questions about Hindu philosophy, dharma, karma, and yoga
- Provide age-appropriate explanations (child, teen, adult modes)
- Cite specific verses from the Bhagavad-Gītā
- Engage in meaningful spiritual conversations
- Make ancient wisdom accessible to modern audiences

## ✨ **Features**

- 🤖 **AI-Powered Chat**: Fine-tuned LLM for accurate spiritual guidance
- 👶 **Multiple Modes**: Child, Teen, Adult/Scholar levels
- 📚 **Verse Citations**: Direct references to Bhagavad-Gītā chapters and verses
- 🌐 **Web Interface**: Beautiful, responsive UI with Om symbolism
- 🔄 **RESTful API**: FastAPI backend for easy integration
- 🎓 **Educational Focus**: Designed for learning and spiritual growth

## 🏗️ **Project Structure**

```
Sanathana Dharma/
├── data/                      # Training datasets and source texts
│   ├── bhagavad-gita-repo/   # Original Gita verses
│   └── jsonl/                 # Processed training data
│
├── finetune/                  # Model training resources
│   ├── notebooks/             # Colab training notebooks
│   ├── configs/               # LoRA and training configs
│   └── README.md              # Fine-tuning guide
│
├── server/                    # FastAPI backend
│   ├── app.py                 # Main API server
│   ├── model_loader.py        # AI model inference
│   ├── models/                # Trained model checkpoints
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Server documentation
│
├── frontend/                  # Web UI
│   ├── index.html             # Main interface
│   ├── style.css              # Styling
│   ├── script.js              # Chat logic
│   └── README.md              # Frontend guide
│
├── rag/                       # RAG implementation (future)
├── infrastructure/            # Deployment configs
├── docs/                      # Documentation
└── README.md                  # This file
```

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8 or higher
- 4GB RAM minimum (8GB recommended)
- Internet connection for downloading models

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd "Sanathana Dharma"
```

### **2. Set Up Virtual Environment**
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### **3. Install Dependencies**
```bash
cd server
pip install -r requirements.txt
```

### **4. Run the Backend Server**
```bash
python app.py
# Server starts on http://localhost:8002
```

### **5. Run the Frontend (New Terminal)**
```bash
cd frontend
python -m http.server 8000
# Open browser to http://localhost:8000
```

## 🎮 **Usage**

### **Web Interface**
1. Open http://localhost:8000 in your browser
2. Select your preferred mode (Child or Scholar)
3. Ask questions about dharma, karma, yoga, or any Bhagavad-Gītā concept
4. Receive AI-generated responses based on sacred texts

### **API Endpoints**

```bash
# Health check
curl http://localhost:8002/health

# Chat with AI
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is dharma?", "mode": "adult"}'

# Get specific verse
curl http://localhost:8002/verses/2/47
```

### **Example Questions**
- "What is dharma according to Krishna?"
- "Explain karma yoga in simple terms"
- "Who is Arjuna and why did he fight?"
- "What does the Gita say about meditation?"
- "Tell me about the three gunas"

## 🎓 **Model Training**

### **Current Model**
- **Base**: DialoGPT / LLaMA-2 7B
- **Method**: LoRA (Low-Rank Adaptation)
- **Dataset**: 381 Bhagavad-Gītā Q&A pairs
- **Platform**: Google Colab (Free/Pro)

### **Train Your Own Model**

1. **Prepare Dataset**
   ```bash
   cd data/jsonl/
   # Add your training data in JSONL format
   ```

2. **Open Training Notebook**
   - Upload `finetune/notebooks/llama_lora_training.ipynb` to Google Colab
   - Select GPU runtime (T4 or better)

3. **Run Training**
   - Follow notebook instructions
   - Training takes 1-3 hours on Colab

4. **Download Model**
   - Save checkpoint to `server/models/`
   - Update model path in `server/app.py`

See [finetune/README.md](finetune/README.md) for detailed instructions.

## 📊 **Current Status**

### **✅ Completed**
- [x] Data collection from Bhagavad-Gītā
- [x] Dataset preprocessing and cleaning
- [x] LoRA fine-tuning pipeline
- [x] FastAPI backend server
- [x] Web chat interface
- [x] Multi-mode support (child/adult)
- [x] Verse retrieval API

### **🔄 In Progress**
- [ ] Improve dataset quality (500+ examples)
- [ ] Retrain with enhanced data
- [ ] Add verse citation in responses
- [ ] Implement RAG for better accuracy

### **📅 Roadmap**
- [ ] Multilingual support (Sanskrit, Hindi, Telugu)
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] User authentication
- [ ] Chat history
- [ ] Vector database integration
- [ ] Deploy to cloud (AWS/GCP)

## 🛠️ **Tech Stack**

### **Backend**
- Python 3.8+
- FastAPI (REST API)
- Hugging Face Transformers
- PyTorch
- PEFT (LoRA fine-tuning)

### **Frontend**
- HTML5, CSS3, JavaScript
- Google Fonts (Poppins)
- Responsive design

### **AI/ML**
- DialoGPT / LLaMA-2 7B
- LoRA adapters
- Google Colab for training

### **Data**
- Bhagavad-Gītā verses (JSON)
- Custom JSONL training datasets

## 📚 **Documentation**

- [Server Documentation](server/README.md) - Backend setup and API reference
- [Fine-tuning Guide](finetune/README.md) - Model training instructions
- [Frontend Guide](frontend/README.md) - UI setup and customization
- [Dataset Guide](START_HERE_CLEAN_DATASET.txt) - Data preparation

## 🤝 **Contributing**

We welcome contributions! Here's how you can help:

1. **Improve Dataset**: Add high-quality Q&A pairs
2. **Enhance UI**: Improve frontend design and UX
3. **Add Features**: Implement new modes or capabilities
4. **Fix Bugs**: Report and fix issues
5. **Documentation**: Improve guides and examples

### **Development Setup**
```bash
# Fork the repository
# Clone your fork
git clone <your-fork-url>

# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git commit -am "Add your feature"

# Push and create PR
git push origin feature/your-feature-name
```

## 🐛 **Troubleshooting**

### **Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r server/requirements.txt --force-reinstall
```

### **Model loading errors**
- Ensure `server/models/checkpoint-180/` exists
- Verify sufficient RAM (minimum 4GB)
- Check model files are not corrupted

### **Frontend can't connect**
- Verify backend is running on port 8002
- Check `script.js` API_URL matches backend
- Disable browser CORS extensions

### **CORS errors**
- Use `python -m http.server` instead of opening HTML directly
- Or add CORS headers in `server/app.py`

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Bhagavad-Gītā** - The eternal source of wisdom
- **Hugging Face** - Transformers library and model hub
- **Google Colab** - Free GPU resources for training
- **FastAPI** - Modern Python web framework
- **Contributors** - Everyone who helps improve this project

## 📞 **Contact**

- **Project**: Thanvish.AI
- **Purpose**: Making Sanātana Dharma accessible through AI
- **Goal**: Educational and spiritual growth

## 🌟 **Star This Project**

If you find this project useful, please consider giving it a star ⭐ on GitHub!

---

<div align="center">
  
**🕉️ Sarve Bhavantu Sukhinah, Sarve Santu Nirāmayāḥ 🕉️**

*May all be happy, may all be free from disease*

**Developed with ❤️ for spreading spiritual wisdom**

</div>
