export interface imagemetadata {
    name: string,
    versionInfo: {
        id: string,
        name: string
    },
    filepath: string,
    fileType: string,
    dimensions: {
        width: number,
        height: number
    },
    thumbnailUrl: string
}
export interface imagetransformoptions {
    "transformations": {
        "resize"?: {
            "width"?: number,
            "height"?: number
        },
        "crop"?: {
            "width"?: number,
            "height"?: number,
            "x": number,
            "y": number
        },
        "rotate"?: number,
        "format"?: string,
        "filters"?: {
            "grayscale": boolean,
            "sepia": boolean
        }
    }
}