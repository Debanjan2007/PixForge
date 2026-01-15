import ImageKit from "imagekit";


const connectImageKit = (pubkey: string , privatekey: string , urlEndpoint: string) => {
    return new ImageKit({
        publicKey: pubkey,
        privateKey: privatekey,
        urlEndpoint: urlEndpoint
    })
}

export {
    connectImageKit
}