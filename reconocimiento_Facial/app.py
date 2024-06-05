from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
from PIL import Image
from io import BytesIO
import os

app = Flask(__name__)

@app.route('/compare_images', methods=['POST'])
def compare_images():
    try:
        data = request.get_json()
        IBV = data['IBV']
        IBC = data['IBC']

        img1 = base64.b64decode(IBV.split(",")[1])
        img2 = base64.b64decode(IBC.split(",")[1])

        img1_path = 'img1.jpg'
        img2_path = 'img2.jpg'

        with open(img1_path, 'wb') as f:
            f.write(img1)

        with open(img2_path, 'wb') as f:
            f.write(img2)

        result = DeepFace.verify(img1_path, img2_path, model_name='VGG-Face')

        os.remove(img1_path)
        os.remove(img2_path)

        if result["verified"]:
            return jsonify({'success': True, 'message': 'Las imágenes coinciden'})
        else:
            return jsonify({'success': False, 'error': 'Las imágenes no coinciden'})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)