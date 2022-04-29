"use strict";
const { Usuario } = require("../modelos");
const { Producto } = require("../modelos");
const multer = require('multer')
class ProductsController {
  async index(req, res, next) {
    try {
      //const usuarioId = req.session.usuarioLogado._id;
      const usuarioId = req.apiUserId;
      const usuario = await Usuario.findById(usuarioId);

      if (!usuario) {
        next(new Error("usuario no encontrado"));
        return;
      }

      const nombre = req.query.nombre;
      const precio = req.query.precio;
      const venta = req.query.venta;
      const tags = req.query.tags;
      const foto = req.query.foto;
      const skip = req.query.skip;
      const limit = req.query.limit;
      const select = req.query.select;
      const sort = req.query.sort;
      const filtros = {};

      if (nombre) {
        filtros.nombre = new RegExp("^" + req.query.nombre, "i");
        console.log("Filtros" + filtros);
      }
      if (precio) {
        if (precio < 0) {
          filtros.precio = { $lte: precio * -1 };
        } else {
          filtros.precio = precio;
        }
      }
      if (venta) {
        filtros.venta = venta;
      }
      if (tags) {
        filtros.tags = tags;
      }
      if (foto) {
        filtros.foto = foto;
      }
      const productos = await Producto.lista(
        filtros,
        skip,
        limit,
        select,
        sort
      );

      const respuesta = {
        email: usuario.email,
        session: {
          usuarioLogado: usuarioId,
        },
        productos,
      };
      console.log(respuesta);
      res.render("products", respuesta);
    } catch (error) {
      next(error);
      return;
    }
  }

  async post(req, res, next) {
    try {

      console.log("foto:",req.file);
      const productoData = req.body;

      const producto = new Producto(productoData);
      producto.foto = '/img_productos/' + req.file.originalname;
      console.log(producto)

      const productoGuardado = await producto.save();

      res.status(201).json({ result: productoGuardado });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductsController;
