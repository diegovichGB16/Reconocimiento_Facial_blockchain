import { generateEd25519Key } from "@spruceid/didkit-wasm-node";
import { keyToDID } from "@spruceid/didkit-wasm-node";
import { keyToVerificationMethod } from "@spruceid/didkit-wasm-node";
import {
    issueCredential as didkitIssueCredential,
    verifyCredential as didkitVerifyCredential,
} from "@spruceid/didkit-wasm-node"
import { v4 as uuidv4 } from 'uuid';

export async function generarCredencial(datos) {
    const clave = generateEd25519Key();
    console.log(clave);
    const did = keyToDID("key", clave);
    console.log("did: ", did);
    const verificationMethod = await keyToVerificationMethod("key", clave);
    console.log("verificacion: ", verificationMethod);
    const date = new Date().toISOString();
    console.log("date: ", date);

    const datosObjeto = typeof datos === 'string' ? JSON.parse(datos) : datos;
    const credential = await didkitIssueCredential(
        JSON.stringify({
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                {
                    DeviceInformation: {
                        "@id": "https://example.org/DeviceInformation",
                        "@context": {
                            os: {
                                "@id": "https://example.org/os",
                                "@context": {
                                    name: "https://example.org/os/name",
                                    version: "https://example.org/os/version"
                                }
                            },
                            seedOtp: "https://example.org/seedOtp"
                        }
                    },
                    ProfileInformation: {
                        "@id": "https://example.org/ProfileInformation",
                        "@context": {
                            RegistrationMode: "https://example.org/RegistrationMode",
                            ethereumAddress: "https://schema.org/Text",
                            Biometrics: "https://example.org/Biometrics"
                        }
                    },
                    Biometrics: {
                        "@id": "https://example.org/Biometrics",
                        "@context": {
                            type: "https://example.org/Biometrics/type",
                            version: "https://example.org/Biometrics/version",
                            format: "https://example.org/Biometrics/format",
                            BiometricsData: "https://example.org/Biometrics/BiometricsData"
                        }
                    },
                    KeyCliente: {
                        "@id": "https://example.org/KeyCliente",
                        "@context": {
                            Clave: "https://example.org/KeyCliente/Clave"
                        }
                    },
                    ts: "https://example.org/ts"
                }
            ],
            id: `urn:uuid:${uuidv4()}`,
            type: ["VerifiableCredential", "Address"],
            issuer: did,
            issuanceDate: date,
            credentialSubject: {
                id: did,
                ...datosObjeto,
            }
        }),
        JSON.stringify({
            proofPurpose: "assertionMethod",
            verificationMethod: verificationMethod,
        }),
        clave
    );
    return JSON.parse(credential);

}

export async function verificar(credencial) {
    const credencialVerificable = credencial;
    const verifyStr = await didkitVerifyCredential(
        JSON.stringify(credencialVerificable),
        JSON.stringify({
            proofPurpose: "assertionMethod",
        })
    );
    const verify = JSON.parse(verifyStr);
    return verify;
}