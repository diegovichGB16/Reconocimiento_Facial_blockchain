import { detectHaarFace } from "../UtilsCv/haarFaceDetection";
import cv from '@techstark/opencv-js'


function process(capturedImage, callback) {
    const imgElement = document.createElement("img");
    imgElement.src = capturedImage;

    imgElement.onload = () => {
        const img = cv.imread(imgElement);
        const imgGray = new cv.Mat();
        const haarface = detectHaarFace(img);

        if (haarface != null) {
            const desiredWidth = 120;
            const desiredHeight = 120;

            cv.cvtColor(haarface, imgGray, cv.COLOR_BGR2GRAY);
            const canvas = document.createElement('canvas');
            const resizedRoi = new cv.Mat();
            cv.resize(imgGray, resizedRoi, new cv.Size(desiredWidth, desiredHeight), 0, 0, cv.INTER_AREA);

            cv.imshow(canvas, resizedRoi);
            const canvasDataURL = canvas.toDataURL("image/jpeg");

            // Liberar la memoria de las matrices
            img.delete();
            imgGray.delete();
            haarface.delete();

            callback(canvasDataURL); // Llama a la función de retorno con la imagen en escala de grises
        } else {

            callback(null);
        }

    };
}

export default process;