const { Op, where } = require("sequelize");
const { Author, Review } = require("../models");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Konfigurasi Multer untuk menangani upload file
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

cloudinary.config({
  cloud_name: "dcisb7ayn",
  api_key: "258396789225291",
  api_secret: "GjyyD6fm9tLauJNOcKz0CN-yVmY",
});

class ReviewController {
  static async readReviewUser(req, res, next) {
    try {
        // Pastikan loginInfo ada
        const { userId } = req.loginInfo;
        if (!userId) throw { name: "Unauthorized" };

        // Cari semua review yang dimiliki oleh user yang sedang login
        const reviewed = await Review.findAll({
            where: {
                authorId: userId
            },
            include: [Author] // Menyertakan informasi Author jika diperlukan
        });

        res.status(200).json({
            message: "Success Read User Reviews",
            reviewed,
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

  static async readReview(req, res, next) {
    try {
      const reviewed = await Review.findAll();
      res.status(200).json({
        message: "Success Read Review",
        reviewed,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async addReview(req, res, next) {
    upload(req, res, async function (err) {
      try {
        if (err) throw err;

        // Pastikan loginInfo ada
        const { userId } = req.loginInfo;
        if (!userId) throw { name: "Unauthorized" };

        const { name, rate, address, review } = req.body; // Tidak memerlukan authorId dari req.body
        let imageUrl = null;

        // Upload image jika ada
        if (req.file) {
          const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "reviews" },
                (error, result) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(error);
                  }
                }
              );
              stream.end(buffer);
            });
          };

          const result = await streamUpload(req.file.buffer);
          imageUrl = result.secure_url;
        }

        // Buat review
        const reviewed = await Review.create({
          name,
          rate,
          address,
          review,
          authorId: userId, // Gunakan userId dari req.loginInfo
          image: imageUrl,
        });

        res.status(201).json({
          message: "Success Add Review",
          reviewed,
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
  }

  static async reviewDetail(req, res, next) {
    try {
      const { id } = req.params;
      const reviewed = await Review.findByPk(id, {
        include: [Author],
      });

      if (!reviewed) throw { name: "Review Not Found", id };

      res.status(200).json({
        message: `Success read Review with id ${reviewed.id}`,
        reviewed,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async deleteReview(req, res, next) {
    try {
      const { id } = req.params;
      const reviewed = await Review.findByPk(id);

      if (!reviewed) throw { name: "Review Not Found", id };

      await Review.destroy({
        where: {
          id,
        },
      });

      res.status(200).json({
        message: `Success Delete Review with id ${id}`,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async editReview(req, res, next) {
    upload(req, res, async function (err) {
      try {
        if (err) throw err;

        const { id } = req.params;

        // Cari review berdasarkan ID
        const reviewed = await Review.findByPk(id);

        if (!reviewed) throw { name: "Review Not Found", id };

        // Ambil data yang dikirim dari req.body
        const { name, rate, address, review, authorId } = req.body;

        let imageUrl = reviewed.image; // Gunakan URL gambar yang sudah ada

        // Jika ada file yang di-upload, upload ke Cloudinary
        if (req.file) {
          const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "reviews" },
                (error, result) => {
                  if (result) {
                    resolve(result);
                  } else {
                    reject(error);
                  }
                }
              );
              stream.end(buffer);
            });
          };

          const result = await streamUpload(req.file.buffer);
          imageUrl = result.secure_url; // URL dari Cloudinary yang baru
        }

        // Update data review dengan data baru, jika tidak ada gunakan data lama
        await Review.update(
          {
            name: name || reviewed.name,
            rate: rate || reviewed.rate,
            address: address || reviewed.address,
            review: review || reviewed.review,
            authorId: authorId || reviewed.authorId,
            image: imageUrl,
          },
          {
            where: {
              id,
            },
          }
        );

        res.status(200).json({
          message: `Success Update Review with id ${id}`,
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
    });
  }

  static async gemini(req, res, next) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const { harga, lokasi } = req.body;

      const prompt = `
      Saya ingin menginap di hotel dengan harga sekitar ${harga} rupiah di ${lokasi}.
      Bisakah Anda merekomendasikan beberapa hotel dengan deskripsi singkat?
      Tolong urutkan hotel-hotel tersebut dengan angka 1, 2, 3, dan seterusnya. Jangan gunakan tanda bintang (*) atau garis miring baru. Sebutkan hanya nama hotel, harga, dan deskripsi dalam format teks biasa.
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      console.log("Raw AI Output:", text);

      // Mengirimkan seluruh teks AI sebagai respons
      res.status(200).json({
        message: "Success",
        data: text,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}

module.exports = ReviewController;
