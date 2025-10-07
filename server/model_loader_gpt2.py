#!/usr/bin/env python3
"""
GPT-2 Model Loader for Sanatana Dharma LLM
Uses GPT-2 as a working model that fits in memory
"""

import torch
import time
import logging
from transformers import AutoTokenizer, AutoModelForCausalLM

logger = logging.getLogger(__name__)

class SanatanaLLMGPT2:
    """GPT-2 based AI model for Bhagavad-Gita knowledge"""
    
    def __init__(self, model_path="gpt2", device="cpu"):
        self.model_path = model_path
        self.device = device
        self.tokenizer = None
        self.model = None
        
        self._load_model()
    
    def _load_model(self):
        try:
            logger.info("Loading GPT-2 tokenizer...")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            logger.info("Loading GPT-2 model...")
            
            # Load model with memory optimizations
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.float32,  # Use float32 for CPU compatibility
                low_cpu_mem_usage=True
            )
            
            logger.info("GPT-2 model loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise e
    
    def generate_response(self, prompt, mode="scholar", max_length=512, temperature=0.8):
        """Generate response using GPT-2"""
        try:
            start_time = time.time()
            
            # Format prompt based on mode
            if mode == "child":
                system_prompt = f"{prompt}"
            else:
                system_prompt = f"{prompt}"
            
            # Tokenize input
            inputs = self.tokenizer(
                system_prompt, 
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=100
            )
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs.input_ids,
                    attention_mask=inputs.attention_mask,
                    max_new_tokens=500,
                    min_new_tokens=100,  # Force at least 100 new tokens
                    temperature=0.9,
                    do_sample=True,
                    pad_token_id=self.tokenizer.pad_token_id,
                    num_return_sequences=1,
                    top_p=0.92,
                    top_k=60,
                    repetition_penalty=1.3,
                    length_penalty=1.0
                )
            
            # Decode response
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Debug: Log the raw response before cleaning
            logger.info(f"Raw response: {response[:200]}...")
            
            # Clean response
            response = self._clean_response(response, system_prompt)
            
            # Debug: Log the cleaned response
            logger.info(f"Cleaned response: {response[:200]}...")
            
            # Remove the original prompt from response if it's still there
            if system_prompt in response:
                response = response.replace(system_prompt, "").strip()
            
            # Remove common artifacts - order matters!
            response = response.replace("? Assistant:", "")
            response = response.replace("Assistant:", "")
            response = response.replace("Answer:", "")
            
            # Remove leading "?" if present
            response = response.lstrip("? ").strip()
            
            # Remove "Explain in" prefix if present
            if response.startswith("Explain in"):
                parts = response.split(":", 1)
                response = parts[1] if len(parts) > 1 else response
            
            # Remove "in Bhagavad-Gītā" at the start if standalone
            if response.startswith("in Bhagavad-Gītā"):
                response = response[len("in Bhagavad-Gītā"):].strip()
            
            # Clean formatting artifacts
            response = response.replace("READ MORE ›", "")
            response = response.replace("Read More", "")
            response = response.replace("READ MORE INV", "")
            response = response.replace("‎ Appears in", "\n\nReference: Appears in")
            response = response.replace("‑", "-")  # Replace special dash
            
            # Remove stray punctuation artifacts
            response = response.replace(" - \n\n", "\n\n")
            response = response.replace(":nd ", ": ")
            
            response = response.strip()
            
            # Clean up multiple dots
            import re
            response = re.sub(r'\.{3,}', '...', response)  # Replace 4+ dots with 3
            
            # Clean up spacing
            response = re.sub(r'\n+', '\n\n', response)  # Multiple newlines to double
            response = re.sub(r' +', ' ', response)  # Multiple spaces to single
            
            # Add proper structure for verses
            response = re.sub(r'\bVerse (\d+)', r'\n\nVerse \1:', response)
            response = re.sub(r'\bChapter (\d+)', r'\n\nChapter \1:', response)
            
            # Clean up Sanskrit formatting
            response = re.sub(r'\|\|(\d+)\|\|', r'(Verse \1)', response)
            
            # Remove excessive punctuation
            response = re.sub(r'[?.]{2,}', '.', response)
            
            # Remove incomplete sentences at the end
            # If ends with incomplete thought like "So you cannot understand this verse because it says nothing of form and action; like a batman sitting by his bedside,."
            # Keep only complete, meaningful sentences
            sentences = response.split('.')
            if len(sentences) > 1 and len(sentences[-1].strip()) < 20:
                response = '.'.join(sentences[:-1]) + '.'
            
            # Final cleanup
            response = response.strip()
            
            # Extract citations
            citations = self._extract_citations(response)
            
            return {
                "response": response,
                "citations": citations,
                "audio_url": "",
                "mode": mode,
                "confidence": 0.8,
                "generation_time": time.time() - start_time,
                "model_used": "gpt2"
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "response": "I'm working on understanding your question better. Could you please rephrase it?",
                "citations": ["Bhagavad-Gītā (AI-generated)"],
                "audio_url": "",
                "mode": mode,
                "confidence": 0.7,
                "generation_time": time.time() - start_time,
                "model_used": "gpt2"
            }
    
    def _clean_response(self, response, original_prompt):
        """Clean the generated response"""
        if not response:
            return "I'm working on understanding your question. Please try rephrasing it."
        
        response = response.strip()
        
        # Remove the original prompt from the response
        if original_prompt in response:
            response = response.replace(original_prompt, "").strip()
        
        # Keep the full response without aggressive sentence filtering
        # The model generates dots as part of verse formatting
        pass
        
        if response and not response.endswith(('.', '!', '?')):
            response += '.'
        
        # Don't use fallback - return what the model actually generated
        # if len(response) < 50:
        #     return "The Bhagavad-Gita teaches us about righteous living, duty, and spiritual wisdom. It emphasizes the importance of following one's dharma (duty) while maintaining detachment from results."
        
        return response
    
    def _extract_citations(self, response):
        """Extract citations from response"""
        citations = []
        
        # Look for common Bhagavad-Gita references
        if any(word in response.lower() for word in ['karma', 'dharma', 'yoga', 'krishna', 'arjuna']):
            citations.append("Bhagavad-Gītā (AI-generated)")
        
        if not citations:
            citations.append("Bhagavad-Gītā (AI-generated)")
        
        return citations

