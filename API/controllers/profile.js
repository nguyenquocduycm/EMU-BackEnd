const Config = require("../dbConfig/rdbconfig");
const sql = require("mssql");
const cloudinary = require("cloudinary");
const ImgConfig = require("../dbConfig/cloudImgConfig");
const configNeo4j = require("../dbConfig/neo4jconfig");
const { initParams } = require("request");
exports.Create_Profile = async (req, res, next) => {

    try {
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
            .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
            .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");
        if (MaTruongKhoa.recordsets[0]) {
            //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
            //res.status(200).json();
            let profile = await pool.request()
                .input('IDSignin', sql.VarChar, req.userData._id)
                .input('HoTen', sql.NVarChar, req.body.HoTen)
                .input('Email', sql.VarChar, req.userData.username)
                .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
                .input('AnhSV', sql.VarChar, req.body.AnhSV)
                .execute('InsertProfile')
            res.status(200).json({ message: "profile created" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Post_Profile_Picture = async (req, res, next) => {
    try {
        cloudinary.config(ImgConfig);
        //F:\duy\Profile Picture Zoom

        const test = async () => {
            try {
                const file = req.files.image;

                var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/Profile' })
                if (a) {
                    var temp = {
                        "IDImages": a.public_id,
                        "AnhSV": a.url
                    };

                    try {
                        let pool = await sql.connect(Config);

                        let profile = await pool.request()
                            .input('AnhSV', sql.VarChar, temp.AnhSV)
                            .input('IDImages', sql.VarChar, temp.IDImages)
                            .input('IDSignin', sql.VarChar, req.userData._id)
                            .execute('UploadImageProfile')
                        res.status(200).json({ message: "Image posted" });
                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                }

                res.status(200);
            } catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        }
        test();

    }
    catch (error) {
        res.status(500).json(error);
    }
}

exports.Post_Profile_Picture_For_Parent = async (req, res, next) => {
    try {
        cloudinary.config(ImgConfig);
        //F:\duy\Profile Picture Zoom

        const test = async () => {
            try {
                const file = req.files.image;

                var a = await cloudinary.uploader.upload(file.tempFilePath, {}, { folder: '/Profile' })
                if (a) {
                    var temp = {
                        "IDImages": a.public_id,
                        "AnhSV": a.url
                    };

                    try {
                        let pool = await sql.connect(Config);

                        let profile = await pool.request()
                            .input('AnhSV', sql.VarChar, temp.AnhSV)
                            .input('IDImages', sql.VarChar, temp.IDImages)
                            .input('IDSignin', sql.VarChar, req.userData._id)
                            .execute('UploadImageProfileParent')
                        res.status(200).json({ message: "Image posted" });
                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                }

                res.status(200);
            } catch (error) {
                console.log(error);
                res.status(500).json(error);
            }
        }
        test();

    }
    catch (error) {
        res.status(500).json(error);
    }
}

exports.Delete_Profile_Picture = async (req, res, next) => {

    try {
        cloudinary.config(ImgConfig);
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .query("SELECT IDImages FROM [dbo].[InfoSinhVien] where IDSignin=@IDSignin;");

        const imagedelete = MaTruongKhoa.recordsets[0][0]["IDImages"];
        if (imagedelete !== undefined) {
            cloudinary.uploader.destroy(imagedelete, function (error, result) {
                if (result) {
                }
                else {
                    //res.status(500).json();
                }
            })
            let profile = await pool.request()
                .input('IDSignin', sql.VarChar, req.userData._id)
                .execute('DeleteImageProfile')
            res.status(200).json({ message: "Images deleted" });
        }
        else {
            res.status(500).json({ message: "image doesnt delete" })
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

exports.Delete_Profile_Picture_For_Parent = async (req, res, next) => {

    try {
        cloudinary.config(ImgConfig);
        let pool = await sql.connect(Config);

        let MaTruongKhoa = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .query("SELECT IDImages FROM [dbo].[InfoPhuHuynh] where IDSignin=@IDSignin;");

        const imagedelete = MaTruongKhoa.recordsets[0][0]["IDImages"];
        if (imagedelete !== undefined) {
            cloudinary.uploader.destroy(imagedelete, function (error, result) {
                if (result) {
                }
                else {
                    //res.status(500).json();
                }
            })
            let profile = await pool.request()
                .input('IDSignin', sql.VarChar, req.userData._id)
                .execute('DeleteImageProfileParent')
            res.status(200).json({ message: "Images deleted" });
        }
        else {
            res.status(500).json({ message: "image doesnt delete" })
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

exports.Edit_Profile = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let Info = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");
        if (Info.recordsets[0]) {
            const session = configNeo4j.getSession(req);
            const query = "match (s:STUDENT {email: $Email}) SET s.name = $name " +
                "with s " +
                "match(f1:Faculty {code: $preFaculty}) -[:BELONG_TO]-> (u:University {code:$PreUniversity}) " +
                "match (f2:Faculty {code: $posFaculty}) -[:BELONG_TO]-> (u:University {code: $PosUniversity}) " +
                "match (s) -[r:STUDY_AT]->(f1) delete r " +
                "merge (s) -[:STUDY_AT]->(f2) ";
            var result = session.readTransaction(tx => {
                return tx.run(query, {
                    preFaculty: Info.recordsets[0][0]["MaKhoa"],
                    PreUniversity: Info.recordsets[0][0]["MaTruong"],
                    posFaculty: req.body.MaKhoa,
                    PosUniversity: req.body.MaTruong,
                    name: req.body.HoTen,
                    Email: req.userData.username
                })
                    .then(async (re1) => {

                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: err });
                    })
            });


            let MaTruongKhoa = await pool.request()
                .input('Ma_Truong', sql.VarChar, req.body.MaTruong)
                .input('Ma_Khoa', sql.VarChar, req.body.MaKhoa)
                .query("Select uf.ID from University u,Faculty f, University_Faculty uf where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and u.MaTruong= @Ma_Truong and f.MaKhoa=@Ma_Khoa;");

            //console.log(MaTruongKhoa.recordsets[0][0]["ID"]);
            //res.status(200).json();
            let profile = await pool.request()
                .input('IDSignin', sql.VarChar, req.userData._id)
                .input('HoTen', sql.NVarChar, req.body.HoTen)
                .input('IDTruongKhoa', sql.Int, MaTruongKhoa.recordsets[0][0]["ID"])
                .execute('EditProfile')
            res.status(200).json({ message: "profile edited" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Edit_Profile_For_Parent = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);


        let profile = await pool.request()
            .input('IDSignin', sql.VarChar, req.userData._id)
            .input('HoTen', sql.NVarChar, req.body.HoTen)
            .execute('EditProfileParent')
        res.status(200).json({ message: "profile edited" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Find_Info_From_Full_Name = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, '%' + req.body.HoTen + '%')
            .query("SELECT [InfoSinhVien].Email, InfoSinhVien.HoTen, InfoSinhVien.AnhSV, University.TenTruongDH, Faculty.TenKhoa FROM [dbo].[InfoSinhVien], University_Faculty,University,Faculty where InfoSinhVien.IDTruongKhoa=University_Faculty.ID and University_Faculty.MaTruong=University.MaTruong and University_Faculty.MaKhoa=Faculty.MaKhoa and InfoSinhVien.HoTen LIKE @ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            var results = profiles.recordsets[0];
            for (var j = results.length - 1; j >= 0; --j) {
                if (results[j].Email === req.userData.username) {
                    results.splice(j, 1);
                }
            }
            res.status(200).json(results);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.Find_name = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, '%' + req.body.username + '%')
            .query("SELECT [Email],[HoTen] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email LIKE @ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            var results = profiles.recordsets[0];
            for (var j = results.length - 1; j >= 0; --j) {
                if (results[j].Email === req.userData.username) {
                    results.splice(j, 1);
                }
            }
            res.status(200).json(results);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

exports.View_Profile = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("select sv.HoTen,sv.AnhSV, sv.Email,u.MaTruong, u.TenTruongDH, f.MaKhoa, f.TenKhoa  from InfoSinhVien sv, University_Faculty uf, University u, Faculty f where uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and uf.ID=sv.IDTruongKhoa and IDSignin=@ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            res.status(200).json(profiles.recordsets[0]);
        }
        else {
            res.status(500).json();
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.View_Profile_For_Parent = async (req, res, next) => {
    try {
        let pool = await sql.connect(Config);

        let profiles = await pool.request()
            .input('ID_Signin', sql.VarChar, req.userData._id)
            .query("select ph.HoTen,ph.AnhSV, ph.Email,u.MaTruong, u.TenTruongDH, f.MaKhoa, f.TenKhoa  from InfoSinhVien sv, University_Faculty uf, University u, Faculty f, InfoPhuHuynh ph where ph.IDSinhVien= sv.ID and uf.MaTruong=u.MaTruong and uf.MaKhoa=f.MaKhoa and uf.ID=sv.IDTruongKhoa and ph.IDSignin= @ID_Signin");

        //console.log(facultys.recordsets[0]);
        if (profiles.recordsets[0]) {
            res.status(200).json(profiles.recordsets[0]);
        }
        else {
            res.status(500).json();
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};