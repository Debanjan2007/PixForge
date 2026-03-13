import ImageKit from "imagekit";


const connectImageKit = (pubkey: string , privatekey: string , urlEndpoint: string) => {
    if(!pubkey || !privatekey || !urlEndpoint) {
        console.error("ImageKit configuration is missing. Please check your environment variables.");
        process.exit(1);
    }
    return new ImageKit({
        publicKey: pubkey,
        privateKey: privatekey,
        urlEndpoint: urlEndpoint
    })
}

export {
    connectImageKit
}