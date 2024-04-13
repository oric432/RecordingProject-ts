import * as Minio from "minio";
import dotenv from "dotenv";

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || "",
    port: parseInt(process.env.MINIO_PORT || "0"),
    accessKey: process.env.MINIO_ACCESS_KEY || "",
    secretKey: process.env.MINIO_SECRET_KEY || "",
    useSSL: false,
});

export default minioClient;
