//Proyecto práctico: página web para anunciar una carrera popular.

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const ejs = require("ejs");
const path = require("path");

require('dotenv').config(); //cargar variables de entorno
const session = require("express-session");
const bcryptjs = require('bcryptjs');


const app = express();

//configurando EJS como motor de visualización de vistas
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, 'public'))); //habilita archivo estáticos de la pasta /public

//middleware del body-parser, para que la aplicación pueda procesar los datos enviados en el formulario (en este caso, en la página de inscripción de los corredores)
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/faqs", (req, res) =>{
    res.render("faqs");
});

app.get("/inscripcion", (req, res) => {
    res.render("inscripcion");
});

app.post("/inscripcion", (req, res) => {
        const { nombre, apellido, dni, telefono, calle, numero, ciudad, codigopostal } = req.body;

//aqui se insertará los datos en el BD usando mysql
        const sql = "INSERT INTO corredores (nombre, apellido, dni, telefono, calle, numero, ciudad, codigopostal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [nombre, apellido, dni, telefono, calle, numero, ciudad, codigopostal];

        db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al insertar los datos:', err);
            return;
        }
        //Si la inscripción ha sido bien hecha, enviar una confirmacion para el usuario con el numero de la dorsal
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Inscripción Exitosa!</title>
                <link rel="stylesheet" href="/css/styles.css">
            </head>
            <body>
                <div id="container">
                    <div class="center">
                        <h1>Inscripción realizada con éxito! ✳️</h1>
                        <br>
                        <p>Tu número de dorsal es: <strong>${result.insertId}</strong></p>
                        <br>
                        <p><a href="/">◀️ Volver a la página inicial</a></p>
                    </div>
                </div>
            </body>
            </html>
        `);
    });
    });


//Creando la conexión con el banco de datos usando MySQL:
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'c_popular',
    port: 3306
});

//El extracto de arriba crea la conexión, pero no la establece. Para conectar al BD, hay que llamar la función "connect":
db.connect((err) => {
    if(err) {
        console.log('Error al conectar al banco de datos MySQL:', err);
        return;
    }
    console.log('Conectado al banco de datos MySQL');
});


app.listen(3000, () => {
    console.log("Servidor funcionando en la puerta 3000");
});


//Creación de la ruta de exibición de los corredores


//ruta para exibir los datos del corredor que será editado
app.get("/admin/edit/:id", (req, res) => {
    const sql = "SELECT * FROM corredores WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error al buscar el corredor:", err);
            return res.status(500).send("Error en el servidor");
        }
        res.render("edit", { corredor: result[0] });
    });
});

//ruta para actualizar los datos en el BD:
app.post("/admin/edit/:id", (req, res) => {
const { nombre, apellido, dni, telefono, calle, numero, ciudad, codigopostal } = req.body;
const sql = "UPDATE corredores SET nombre = ?, apellido = ?, dni = ?, telefono = ?, calle = ?, numero = ?, ciudad = ?, codigopostal = ? WHERE id = ?";
const values = [nombre, apellido, dni, telefono, calle, numero, ciudad, codigopostal, req.params.id];

db.query(sql, values, (err, result) => {
    if (err) {
        console.error("Error al actualizar el corredor:", err);
        return res.status(500).send("Error en el servidor");
    }
    res.redirect("/admin");
});
});

//ruta para borrar un corredor
app.post("/admin/delete/:id", (req, res) => {
    const sql = "DELETE FROM corredores WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error("Error al borrar el corredor:", err);
            return res.status(500).send("Error en el servidor");
        }
        res.redirect("/admin");
    });
});


//check del favicon
app.get('/images/favicon.ico', (req, res) => {
    //console.log('Favicon solicitado');
    res.sendFile(path.join(__dirname, 'images', 'favicon.ico'));
});


//configurar express-session: creación de las sesiones de usuarios
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


//Rota GET para exibir o formulário de login
app.get("/login", (req, res) => {
    res.render("login");
});

//Rota POST para procesar el login
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE username = ?";
    db.query(sql, [username], (err, result) => {
        if (err){
            return res.status(500).send("Error en el servidor");
        }

        if (result.length === 0) {
            return res.status(401).send("Usuario no encontrado")
        }

        const user = result[0];

//Comparar la contraseña fornecida con la contraseña almacenada (bcryptjs):
    bcryptjs.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch){
            return res.status(401).send("Contraseña incorrecta!");
        }

        //Salvar la sesion del usuario
        req.session.userId = user.id; // ID del usuario en la sesión
        req.session.username = user.username;

        //Redireccionar para la pagina de administración:
        res.redirect("/admin");
        });
    });
});


//Middleware de autenticación
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect("/login");
}

//Ruta GET para exibir los datos de los corredores (solo si está autenticado)
app.get("/admin", isAuthenticated, (req, res) => {
    const sql = "SELECT * FROM corredores";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al recuperar los datos:", err);
            return res.status(500).send("Error en el servidor");
        }
        res.render("admin", { corredores: results});
    });
});


//Generar hash de la contraseña
bcryptjs.hash("contrasena123", 10, (err, hashedPassword) => {
    if(err) throw err;

    const sql = "INSERT INTO usuarios (username, password) VALUES (?, ?)";
    db.query(sql, ["admin", hashedPassword], (err, result) => {
        if(err) throw err;
        console.log("Usuario creado con éxito!");
    });
});


//Ruta GET para el logout
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error al salir");
        }
        res.redirect("/login");
    });
});


//Ruta GET para contacto:
app.get("/contacto", (req, res) => {
    res.render("contacto");
});

app.post("/contacto", (req, res) => {

    console.log("Rota POST /contato foi chamada");
    console.log("Dados recebidos:", req.body);
    
    const { nombre, telefono, email, ciudad, mensaje } = req.body;

    console.log(`Nombre: ${nombre}`);
    console.log(`Telefono: ${telefono}`);
    console.log(`Email: ${email}`);
    console.log(`Ciudad: ${ciudad}`);
    console.log(`Mensaje: ${mensaje}`);


//mensaje de confirmacion tras el envío del formulario
res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje Enviado</title>
        <link rel="stylesheet" href="/css/styles.css">
    </head>
    <body>
        <div id="container">
            <div class="center">
                <h1>¡Gracias por contactarnos!</h1>
                <br>
                <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
                <br>
                <p><a href="/">◀️ Volver a la página inicial</a></p>
            </div>
        </div>
    </body>
    </html>
`);
});