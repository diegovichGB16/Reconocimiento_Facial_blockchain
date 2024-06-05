import cv from "@techstark/opencv-js";
import { loadDataFile } from "./cvDataFile";

export async function loadHaarFaceModels() {
    try {
        console.log("=======start downloading Haar-cascade models=======");
        await loadDataFile(
            "haarcascade_frontalface_default.xml",
            "models/haarcascade_frontalface_default.xml"
        );
        //  await loadDataFile("haarcascade_eye.xml", "models/haarcascade_eye.xml");
        // console.log("=======downloaded Haar-cascade models=======");
    } catch (error) {
        console.error(error);
    }
}

/**
 * Detect faces from the input image.
 * See https://docs.opencv.org/master/d2/d99/tutorial_js_face_detection.html
 * @param {cv.Mat} img Input image
 * @returns a new image with detected faces drawn on it.
 */
export function detectHaarFace(img) {
    try {
        const newImg = img.clone();
        const gray = new cv.Mat();
        cv.cvtColor(newImg, gray, cv.COLOR_RGBA2GRAY, 0);

        const faces = new cv.RectVector();
        const faceCascade = new cv.CascadeClassifier();
        faceCascade.load("haarcascade_frontalface_default.xml");

        // Detectar rostros
        const msize = new cv.Size(0, 0);
        faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);

        if (faces.size() > 0) {
            for (let i = 0; i < faces.size(); ++i) {
                const roiGray = gray.roi(faces.get(i));
                const roiSrc = newImg.roi(faces.get(i));

                const detectedFaceImage = new cv.Mat();
                roiSrc.copyTo(detectedFaceImage);

                roiGray.delete();
                roiSrc.delete();

                // Liberar la memoria de las matrices
                gray.delete();
                faceCascade.delete();
                faces.delete();

                return detectedFaceImage; // Devuelve el rostro detectado
            }
        } else {
            // Si no se detecta ningún rostro, devuelve null
            gray.delete();
            faceCascade.delete();
            faces.delete();
            return null;
        }
    } catch (error) {
        // En caso de error, puedes manejarlo aquí
        console.error("Error en la detección de rostros:", error);
        return null;
    }
}