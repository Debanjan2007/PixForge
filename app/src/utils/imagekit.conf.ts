import ImageKit from "@imagekit/nodejs";

let imagekitClient: ImageKit | null = null

const connectImageKit = (privatekey: string) => {
    imagekitClient = new ImageKit({
        privateKey: privatekey
    })
}

export {
    imagekitClient,
    connectImageKit
}