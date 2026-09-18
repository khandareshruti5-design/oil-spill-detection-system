import cv2
import numpy as np

# Create a 600x600 ocean SAR background with speckle noise
np.random.seed(42)
ocean = np.random.normal(120, 15, (600, 600)).astype(np.uint8)

# Draw dark irregular oil spill patches (low radar backscatter)
cv2.ellipse(ocean, (300, 280), (80, 35), 30, 0, 360, (20), -1)
cv2.ellipse(ocean, (340, 310), (40, 20), 15, 0, 360, (25), -1)

# Apply minor Gaussian blur to smooth spill edges
ocean = cv2.GaussianBlur(ocean, (5, 5), 0)

# Save as sample SAR image inside backend/data folder
cv2.imwrite("data/sample_sar.png", ocean)
print("Successfully generated sample SAR image at 'backend/data/sample_sar.png'")