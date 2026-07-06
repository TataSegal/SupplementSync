# OCR Tool wrapper for Supplement Label Scanning
import base64

def ocr_tool(image_base64: str) -> str:
    """
    Extracts raw text from a base64 encoded supplement label image using OCR.
    """
    # In a real environment, this connects to a local OCR library (like Tesseract)
    # or Google Cloud Vision API. For local testing, we return a mock read response.
    try:
        if not image_base64:
            return "No image data provided."
        
        # Simulating text extraction
        return (
            "Nature's Bounty Super B-Complex. "
            "Directions: For adults, take one (1) tablet daily, preferably with a meal. "
            "Keep out of reach of children. Store at room temperature."
        )
    except Exception as e:
        return f"OCR processing failed: {str(e)}"
