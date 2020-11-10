import multer from "multer";
import {Express} from "express";
import Grid from "gridfs-stream";
import Log from "../utils/Logger";
import mongodb, {Db} from "mongodb";
import {Connector} from "./DB_Abstractor";
import {AnyObject} from "./databases/MongoAccess";
import GridFsStorage from "multer-gridfs-storage";

// todo: dabei komplett überarbeiten!!!
// zuerst werden dateien geuploadet und in db gespeichert. Gibt es innerhalb von x min(configurable) keine verknüpfung zu anderen db objekten wird die datei geloscht.
export async function setupFileAPI(app: Express, logger?: Log): Promise<void> {
    const log = logger || Log.getInstance();

    const db = Connector.getDatabase();

    if (db instanceof Error) {
        log.error("Could not start the server. Connection to database failed: " + db.message);
        return;
    }
    const mongoConnection = await db.getConnection<Db>();

    if (mongoConnection instanceof Error) {
        log.error("Could not start the server. Connection to database failed: " + mongoConnection.message);
        return;
    }


    const storage = new GridFsStorage({
        db: mongoConnection,
        // url:MONGODB_URL
        // file: (req, file) => {
        //     return {
        //         bucketName: "files",
        //         // filename: "file_" + file.id,
        //         // metadata: {
        //         //     size: file.size,
        //         //     mimetype: file.mimetype,
        //         //     uploadDate: file.uploadDate,
        //         //     contentType: file.contentType,
        //         //     originalname: file.originalname
        //         // }
        //     };
        // }
    });

    //config for single file uploads
    const upload = multer({storage}).single("file");

    app.post("/upload", (req, res) => {
        log.info("Upload started:", req.body);

        upload(req, res, (err: any) => {
            log.info("Upload finished:", err);

            if (err) {
                res.json({error_code: 1, err_desc: err});
                return;
            }
            log.info("Uploaded Fields:", req.body);
            log.info("Uploaded Files:", (req.file as unknown) as AnyObject);

            res.json({error_code: 0, error_desc: null, file_uploaded: true});
        });
    });

    const gfs = Grid(db, mongodb);

    // Downloading a single file
    app.get("/file/:filename", (req, res) => {
        gfs.collection("ctFiles"); //set collection name to lookup into

        /** First check if file exists */
        gfs.files.find({filename: req.params.filename}).toArray(function (err, files) {
            if (!files || files.length === 0) {
                return res.status(404).json({
                    responseCode: 1,
                    responseMessage: "error",
                });
            }
            // create read stream
            const readstream = gfs.createReadStream({
                filename: files[0].filename,
                root: "ctFiles",
            });
            // set the proper content type
            res.set("Content-Type", files[0].contentType);
            // Return response
            return readstream.pipe(res);
        });
    });
}
