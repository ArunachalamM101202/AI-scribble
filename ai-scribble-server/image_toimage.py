import streamlit as st
import requests
import json
from PIL import Image
from io import BytesIO
import base64
import google.generativeai as genai
import os
from typing import Tuple

from google import genai

# -----------------------------------------------------------------------------
# 0. Helper Functions & Configuration
# -----------------------------------------------------------------------------

# Placeholder for API keys if you want to use environment variables
# For Streamlit sharing, use st.secrets

account_id = ""
token = ""

GOOGLE_API_KEY_ENV = ""

client = genai.Client(api_key=GOOGLE_API_KEY_ENV)
CLOUDFLARE_ACCOUNT_ID_ENV = account_id
CLOUDFLARE_TOKEN_ENV = token

# -----------------------------------------------------------------------------
# 1. API Configuration UI Module
# -----------------------------------------------------------------------------

def api_configuration_ui():
    """Handles the UI for API key inputs."""
    st.sidebar.title("⚙️ API Configuration")
    
    st.sidebar.subheader("Google AI (Gemini)")
    google_api_key_input = st.sidebar.text_input(
        "Google AI API Key",
        type="password",
        help="Your Google AI API key for Gemini.",
        value=GOOGLE_API_KEY_ENV if GOOGLE_API_KEY_ENV else ""
    )

    st.sidebar.subheader("Cloudflare AI")
    # Pre-filled values from your original code, editable
    default_cf_account_id = CLOUDFLARE_ACCOUNT_ID_ENV if CLOUDFLARE_ACCOUNT_ID_ENV else "e8869ba5d2a40f6fa9027f4105f5ce37"
    default_cf_token = CLOUDFLARE_TOKEN_ENV if CLOUDFLARE_TOKEN_ENV else "Fu1l_ugdtHOCw_lXEzA_HFnmPxW-D02ZgBHKMDhX"

    cf_account_id_input = st.sidebar.text_input(
        "Cloudflare Account ID",
        value=default_cf_account_id
    )
    cf_token_input = st.sidebar.text_input(
        "Cloudflare API Token",
        type="password",
        value=default_cf_token
    )
    
    return google_api_key_input, cf_account_id_input, cf_token_input

# -----------------------------------------------------------------------------
# 2. Google Gemini (Caption Generation) Module
# -----------------------------------------------------------------------------


from PIL import Image
from io import BytesIO
import base64
import ollama
import streamlit as st

# def generate_caption_with_ollama(uploaded_image_file: BytesIO, mime_type: str) -> tuple[str | None, str | None]:
#     """
#     Generates a caption using a local Ollama model (e.g., LLaVA) using ollama.generate().
#     """
#     try:
#         image_bytes = uploaded_image_file.read()
#         uploaded_image_file.seek(0)

#         image_b64 = base64.b64encode(image_bytes).decode('utf-8')

#         with st.spinner("🤖 LLaVA (via Ollama) is generating a caption..."):
#             response = ollama.generate(
#                 model="llava",
#                 prompt="Generate a one-line descriptive caption for this image. ",
#                 images=[image_b64]  # ✅ CORRECT usage
#             )

#         caption = response.get("response", "").strip()
#         caption+="which is photo realistic picture captured by a camera in 4K resolution"
#         if not caption:
#             return None, "No caption returned by LLaVA."

#         return caption, None

#     except Exception as e:
#         return None, f"Ollama LLaVA error: {str(e)}"

def generate_caption_with_ollama(uploaded_image_file: BytesIO, mime_type: str) -> tuple[str | None, str | None]:
    """
    Combines LLaVA + LLaMA pipeline:
    - Generate caption from image using LLaVA
    - Refine it using LLaMA for realism and 4K style

    Returns:
        (refined_caption, error_message)
    """
    try:
        # ---- IMAGE → LLaVA → RAW CAPTION ----
        image_bytes = uploaded_image_file.read()
        uploaded_image_file.seek(0)
        image_b64 = base64.b64encode(image_bytes).decode('utf-8')

        with st.spinner("🤖 LLaVA is generating a raw caption..."):
            llava_response = ollama.generate(
                model="llava",
                prompt="Generate a one-line descriptive caption for this image.",
                images=[image_b64]
            )

        raw_caption = llava_response.get("response", "").strip()
        if not raw_caption:
            return None, "LLaVA did not return a caption."

        # ---- RAW CAPTION → LLaMA → REFINED ----
        refined_caption, llama_error = refine_caption_with_llama(raw_caption)
        if llama_error:
            return None, llama_error

        return refined_caption, None

    except Exception as e:
        return None, f"Ollama LLaVA/LLaMA error: {str(e)}"

def refine_caption_with_llama(raw_caption: str) -> tuple[str | None, str | None]:
    """
    Refines the given caption using LLaMA via Ollama.
    Enforces 'Realistic art style 4K output' and removes undesired styles.
    """
    try:
        system_prompt = (
            "You are a helpful assistant that rewrites image generation prompts. "
            "Ensure the final caption includes the phrases 'Realistic 4K output' and 'Generate a whole image'"
            "Remove any words or implications related to: art style, line drawing, pencil art style, hand drawn, black and white, or cartoon."
            "REPLY ONLY WITH THE REFINED CAPTION. NOTHING ELSE."
        )

        user_prompt = f"Original caption: {raw_caption}\n\nPlease rewrite it accordingly."

        response = ollama.chat(
            model="llama3",  # or another local language model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        refined = response.get("message", {}).get("content", "").strip()
        if not refined:
            return None, "LLaMA returned no refined caption."

        return refined, None

    except Exception as e:
        return None, f"LLaMA error: {str(e)}"
    
# -----------------------------------------------------------------------------
# 3. Cloudflare Image Generation Module
# -----------------------------------------------------------------------------

# def generate_image_with_cloudflare(account_id: str, token: str, prompt: str) -> (Image.Image, str, int):
def generate_image_with_cloudflare(account_id: str, token: str, prompt: str) -> tuple[Image.Image | None, str | None, int | None]:
    """
    Generates an image using Cloudflare AI based on a prompt.

    Args:
        account_id: Cloudflare account ID.
        token: Cloudflare API token.
        prompt: The text prompt for image generation.

    Returns:
        A tuple containing (PIL.Image object, error_message, status_code).
        If successful, Image is not None, error_message is None.
        If failed, Image is None, error_message is a string.
        status_code is the HTTP status code of the API call or None.
    """
    if not account_id or not token:
        return None, "Cloudflare Account ID or Token is missing. Please provide them in the sidebar.", None
    if not prompt:
        return None, "Prompt for Cloudflare is empty.", None

    url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning"
    # Alternative models if needed:
    # @cf/stabilityai/stable-diffusion-xl-base-1.0
    # @cf/mistral/mistral-7b-instruct-v0.1 (text)
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "prompt": prompt
    }
    
    error_message = None
    generated_image = None
    status_code = None

    with st.spinner(f"🚀 Cloudflare is generating an image for: '{prompt}'..."):
        try:
            response = requests.post(url, headers=headers, json=data, timeout=120) # Increased timeout
            status_code = response.status_code
            
            if response.headers.get('content-type', '').startswith('image/'):
                generated_image = Image.open(BytesIO(response.content))
            elif response.headers.get('content-type', '').startswith('application/json'):
                response_json = response.json()
                if response_json.get("success") and 'result' in response_json:
                    # Check if 'result' itself is the image data (e.g., base64 string)
                    if isinstance(response_json['result'], dict) and 'image' in response_json['result']:
                        # Assuming 'image' key contains a list of bytes (uint8array) or base64
                        if isinstance(response_json['result']['image'], list): # uint8array represented as list
                             image_data = bytes(response_json['result']['image'])
                             generated_image = Image.open(BytesIO(image_data))
                        else: # Assuming base64 string
                            image_data = base64.b64decode(response_json['result']['image'])
                            generated_image = Image.open(BytesIO(image_data))
                    elif isinstance(response_json['result'], str): # Direct base64 string
                        image_data = base64.b64decode(response_json['result'])
                        generated_image = Image.open(BytesIO(image_data))
                    else:
                        error_message = f"JSON response, but image data not found or in unexpected format. Response: {response_json}"
                else:
                    error_message = f"API call failed or did not return image. Status: {status_code}. Response: {response_json}"
            else: # Neither direct image nor JSON, try to parse as image anyway
                try:
                    generated_image = Image.open(BytesIO(response.content))
                except Exception as img_err:
                    error_message = (f"Failed to parse response as image. Status: {status_code}. "
                                     f"Content-Type: {response.headers.get('content-type')}. Error: {str(img_err)}. "
                                     f"Raw response: {response.content[:200]}...")
        
        except requests.exceptions.Timeout:
            error_message = "Cloudflare API request timed out. The model might be taking too long."
        except requests.exceptions.RequestException as e:
            error_message = f"Cloudflare request failed: {str(e)}"
        except json.JSONDecodeError:
            error_message = f"Failed to decode JSON response from Cloudflare. Status: {status_code}. Raw response: {response.content[:200]}..."
        except Exception as e: # Catch-all for other unexpected errors like base64 decoding
            error_message = f"An unexpected error occurred with Cloudflare: {str(e)}"

    return generated_image, error_message, status_code



# -----------------------------------------------------------------------------
# 4. Main Streamlit Application
# -----------------------------------------------------------------------------

def main():
    st.set_page_config(layout="wide", page_title="AI Image Generation Workflow")
    st.title("🖼️ Image Captioning (Gemini) & Generation (Cloudflare)")
    st.markdown("""
    Upload an image to generate a caption using Google's Gemini model. 
    Then, use that caption as a prompt to generate a new image with Cloudflare's Stable Diffusion model.
    """)

    # --- API Configuration ---
    google_api_key, cf_account_id, cf_token = api_configuration_ui()

    # --- Main Area ---
    col1, col2 = st.columns(2)

    with col1:
        st.header("1. Upload Image for Captioning")
        uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png", "webp"])

        generated_caption = None # Initialize session state for caption
        
        if 'generated_caption' not in st.session_state:
            st.session_state.generated_caption = None
        if 'last_uploaded_filename' not in st.session_state:
            st.session_state.last_uploaded_filename = None


        if uploaded_file is not None:
            # To prevent re-processing if the same file is kept
            if st.session_state.last_uploaded_filename != uploaded_file.name:
                st.session_state.generated_caption = None # Reset caption for new image
                st.session_state.last_uploaded_filename = uploaded_file.name

            st.image(uploaded_file, caption="Uploaded Image", use_column_width=True)
            
            mime_type = uploaded_file.type
            
            if st.button("✨ Generate Caption with llava"):
                if not google_api_key:
                    st.error("🚨 Google AI API Key is required. Please enter it in the sidebar.")
                else:
                    # caption, error = generate_caption_with_gemini(google_api_key, uploaded_file, mime_type)
                    caption, error = generate_caption_with_ollama(uploaded_file, mime_type)
                    if error:
                        st.error(f"Caption Generation Failed: {error}")
                        st.session_state.generated_caption = None
                    else:
                        st.session_state.generated_caption = caption
                        st.success(f"**Generated Caption:** {caption}")
        
        # Display caption if already generated for current image
        if st.session_state.generated_caption and uploaded_file and st.session_state.last_uploaded_filename == uploaded_file.name:
            st.info(f"**Current Caption:** {st.session_state.generated_caption}")


    with col2:
        st.header("2. Generate Image with Cloudflare")
        
        # Use caption from session state if available, otherwise allow manual input
        prompt_for_cloudflare = st.text_area(
            "Prompt for Cloudflare (auto-filled by Gemini caption, or enter manually):",
            value=st.session_state.generated_caption if st.session_state.generated_caption else "a futuristic cityscape at sunset",
            height=100
        )

        if st.button("🎨 Generate Image with Cloudflare", key="generate_cf_image"):
            if not cf_account_id or not cf_token:
                st.error("🚨 Cloudflare Account ID and Token are required. Please enter them in the sidebar.")
            elif not prompt_for_cloudflare:
                st.warning("📋 Please provide a prompt for Cloudflare (either from Gemini or manually).")
            else:
                cloudflare_image, cf_error, cf_status_code = generate_image_with_cloudflare(
                    cf_account_id, cf_token, prompt_for_cloudflare
                )

                if cf_error:
                    st.error(f"Cloudflare Image Generation Failed (Status: {cf_status_code if cf_status_code else 'N/A'}): {cf_error}")
                elif cloudflare_image:
                    st.success(f"Image generated successfully by Cloudflare! (Status: {cf_status_code})")
                    st.image(cloudflare_image, caption=f"Cloudflare Generated Image for: '{prompt_for_cloudflare}'", use_column_width=True)
                    
                    # Download button
                    img_bytesio = BytesIO()
                    cloudflare_image.save(img_bytesio, format="PNG")
                    st.download_button(
                        label="📥 Download Generated Image",
                        data=img_bytesio.getvalue(),
                        file_name=f"cloudflare_generated_{prompt_for_cloudflare[:30].replace(' ', '_')}.png",
                        mime="image/png"
                    )
                else:
                    st.warning("Something went wrong with Cloudflare, but no specific error message was returned.")

    st.sidebar.markdown("---")
    st.sidebar.markdown("""
    ### About this App
    1.  Upload an image.
    2.  Click "Generate Caption" to get a description from Google Gemini.
    3.  The caption auto-fills the prompt for Cloudflare.
    4.  Click "Generate Image" to create a new image using Cloudflare AI.
    """)
    st.sidebar.markdown("---")
    st.sidebar.info("⚠️ Ensure your API keys are correct and have the necessary permissions.")


if __name__ == "__main__":
    main()

