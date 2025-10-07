# 🕉️ Sanātana Dharma LLM - Model Files

## 📁 Model Directory Structure

```
server/models/
├── gpt2-gita-clean/          ← Production model (NOT in Git)
│   ├── model.safetensors     (~500 MB)
│   ├── config.json
│   ├── vocab.json
│   └── ... other files
└── README.md                 ← This file
```

---

## ⚠️ **Model Files Not Included in Git**

The trained model files are **too large for Git** (~500 MB) and are excluded via `.gitignore`.

---

## 📥 **How to Get the Model:**

### **Option 1: Download Pre-trained Model**

**Coming soon:** Download link will be added after final training (7 epochs, loss ~0.5)

### **Option 2: Train Your Own Model**

1. **Upload dataset to Google Colab Pro:**
   - File: `data/jsonl/clean_gita_training_dataset.jsonl` (12,002 examples)

2. **Run training notebook:**
   - File: `GPT2_Clean_Gita_Training.ipynb`
   - Runtime: ~120 minutes with 7 epochs
   - GPU: T4 (Colab Pro)

3. **Download trained model:**
   - Will create: `gpt2-gita-final/` folder
   - Rename to: `gpt2-gita-clean/`
   - Place in: `server/models/`

---

## 📊 **Model Specifications:**

| Attribute | Value |
|-----------|-------|
| **Base Model** | GPT-2 (124M parameters) |
| **Training Data** | 12,002 Bhagavad Gita examples |
| **Scholars** | 22 renowned commentators |
| **Target Loss** | 0.5-0.6 (with 7 epochs) |
| **Quality Score** | 9.5/10 (dataset) |
| **Languages** | Sanskrit, English, Hindi |

---

## 🚀 **Quick Start:**

1. **Ensure model is in place:**
   ```
   server/models/gpt2-gita-clean/
   ├── model.safetensors
   ├── config.json
   └── ... (8 files total)
   ```

2. **Start server:**
   ```bash
   cd server
   python app_gpt2.py
   ```

3. **Verify model loaded:**
   ```bash
   curl http://localhost:8000/health
   ```

   Should return:
   ```json
   {"status":"healthy","model_loaded":true}
   ```

---

## 🔄 **Model Versions:**

### **v1.0 - Initial Training (Current)**
- Epochs: 3
- Training Loss: 1.3
- Status: ⚠️ Functional but needs improvement

### **v2.0 - Retrained (Planned)**
- Epochs: 7
- Expected Loss: 0.5-0.6
- Status: 🎯 Production-ready target

---

## 📝 **Notes:**

- Model runs on CPU (no GPU required for inference)
- Response time: ~5-15 seconds per query
- Memory required: ~2 GB RAM
- Completely offline (no API keys needed)

---

## 🆘 **Troubleshooting:**

### **Error: Model not found**
```
FileNotFoundError: models/gpt2-gita-clean
```
**Solution:** Download or train the model and place in `server/models/gpt2-gita-clean/`

### **Error: Model loading fails**
**Solution:** Ensure all 8 files are present in the model directory

---

**🕉️ For questions or issues, see main project README**

