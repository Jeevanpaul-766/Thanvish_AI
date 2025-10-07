# Sanātana Dharma LLM

**An AI-powered Knowledge System for Hindu Scriptures, Philosophy & Culture**

## 🎯 Vision

Democratize access to Sanātana Dharma knowledge using AI, building a state-owned, scholar-approved LLM trained on scriptures, commentaries, and educational material.

## 🚀 MVP Scope

**Focus: Bhagavad-Gītā** - 1-month prototype covering all 700 shlokas with multilingual support.

## 📁 Project Structure

```
sanatana-llm/
├── data/                    # Training data and scriptures
│   ├── raw/                # Original scriptures and translations
│   ├── cleaned/            # Normalized text data
│   └── jsonl/              # Training dataset (JSONL format)
├── finetune/               # Model fine-tuning
│   ├── train_lora.py       # LoRA fine-tuning script
│   ├── configs/            # Training configurations
│   └── checkpoints/        # Saved model weights
├── rag/                    # Retrieval-Augmented Generation
│   ├── vector_db.py        # FAISS vector database
│   └── retriever.py        # Context retrieval system
├── server/                 # FastAPI backend
│   ├── app.py              # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Container configuration
├── frontend/               # User interfaces
│   ├── web/                # React web application
│   └── mobile/             # React Native mobile app
├── infrastructure/         # Deployment configuration
│   ├── k8s/                # Kubernetes manifests
│   └── ci-cd/              # CI/CD pipeline configs
└── docs/                   # Documentation
    ├── Sanatana_PRD.md     # Product Requirements Document
    ├── BUILD_STEPS_MVP.md  # Development roadmap
    ├── SAFETY_POLICY.md    # Safety and content guidelines
    └── DATA_SCHEMA.md      # Data structure specifications
```

## 🛠️ Technology Stack

- **Frontend**: React Native (mobile) + React.js (web)
- **Backend**: FastAPI + PostgreSQL
- **LLM**: LLaMA/Mistral 7B with LoRA fine-tuning
- **RAG**: FAISS vector database
- **Speech**: Whisper (STT) + Coqui TTS
- **Infrastructure**: GPU VM (AWS/GCP) + containerized deployment

## 🎯 Key Features

### For Children & General Public
- Age-appropriate explanations of verses and stories
- Multilingual support (Sanskrit, Telugu, Hindi, English)
- Safe chanting guidance with text-to-speech
- Vocabulary builder (Sanskrit → local language)

### For Scholars & Teachers
- Deep exegesis with multiple commentary citations
- Comparative views across philosophical schools
- Quiz and lesson plan generation
- Cross-referenced scripture study tools

### For Parents & Educators
- Progress tracking dashboard
- Safe learning path recommendations
- Content filtering and parental controls

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+
- GPU with CUDA support (for training)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sanatana-llm
   ```

2. **Setup backend**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn app:app --reload
   ```

3. **Setup frontend** (coming soon)
   ```bash
   cd frontend/web
   npm install
   npm start
   ```

## 📊 Development Roadmap

| Week | Focus | Deliverables |
|------|-------|-------------|
| 1 | Data Prep | Extract Bhagavad-Gītā, create 500 JSONL examples |
| 2 | Training | Fine-tune LoRA on Gītā dataset |
| 3 | Backend | FastAPI + RAG + TTS/STT |
| 4 | Frontend | React Native app + scholar/child modes |

## 🛡️ Safety & Quality

- **Multi-traditional approach**: Balanced perspectives from all major schools
- **Scholar-approved content**: Reviewed by qualified Sanskrit scholars
- **Age-appropriate filtering**: Safe content for children
- **Citation requirements**: All responses include source references
- **Bias mitigation**: Continuous monitoring and improvement

## 📚 Documentation

- [Product Requirements Document](docs/Sanatana_PRD.md)
- [Build Steps & MVP Roadmap](docs/BUILD_STEPS_MVP.md)
- [Safety Policy](docs/SAFETY_POLICY.md)
- [Data Schema](docs/DATA_SCHEMA.md)

## 🤝 Contributing

This project follows strict guidelines for accuracy, neutrality, and cultural sensitivity. Please review our [Safety Policy](docs/SAFETY_POLICY.md) before contributing.

## 📄 License

[To be determined - considering open source with cultural preservation focus]

## 🙏 Acknowledgments

- Sanskrit scholars and religious leaders for guidance
- Open source AI community for foundational technologies
- Cultural preservation organizations for support

---

**Building the future of AI-powered cultural education, one verse at a time.**
