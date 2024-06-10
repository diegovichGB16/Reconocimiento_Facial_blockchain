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
                                    name: "@name",
                                    version: "@version"
                                }
                            },
                            seedOtp: "@seedOtp"
                        }
                    },
                    ProfileInformation: {
                        "@id": "https://example.org/ProfileInformation",
                        "@context": {
                            RegistrationMode: "@RegistrationMode",
                            ethereumAddress: "https://schema.org/Text",
                            Biometrics: "@Biometrics"
                        }
                    },
                    Biometrics: {
                        "@id": "https://example.org/Biometrics",
                        "@context": {
                            type: "@type",
                            version: "@version",
                            format: "@format",
                            BiometricsData: "@BiometricsData"
                        }
                    },
                    KeyCliente: {
                        "@id": "https://example.org/KeyCliente",
                        "@context": {
                            Clave: "@Clave"
                        }
                    },
                    ts: "@ts"
                }
            ],
            id: `urn:uuid:${uuidv4()}`,
            type: ["VerifiableCredential", "Address"],
            issuer: did,
            issuanceDate: date,
            credentialSubject: {
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