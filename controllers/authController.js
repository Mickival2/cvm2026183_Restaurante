const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Asegúrate que la ruta a tu modelo sea correcta

// Registro de usuario
exports.register = async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        // Verificar si el usuario ya existe
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        // Crear un nuevo usuario
        user = new User({
            nombre,
            email,
            password
        });

        // Encriptar el password antes de guardarlo en la base de datos
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Guardar el usuario en la base de datos
        await user.save();

        // Crear el payload para el token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        // Firmar el token JWT
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send('Error en el servidor');
    }
};

const password1 = 'elvispiso17';
const hash = '$2a$10$oLMOB3aXDhvJCA.dyIQkGOndZXgSPvcvcMlMvAej/o.16LiGaMLiG';

bcrypt.compare(password1, hash, (err, isMatch) => {
    if (err) throw err;
    console.log("Comparacion manual: ", isMatch); // Debería ser true si todo está bien
});


// Inicio de sesión
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verificar si el usuario existe
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales incorrectas - login' });
        }

        // Verificar la contraseña (no necesitas cifrar antes de comparar)
        console.log("Contraseña cifrada BD: ", user.password);
        console.log("Contraseña ingresada por el usuario: ", password)
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Comparacion: ", isMatch)
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales incorrectas - comparacion' });
        }

        // Crear el payload para el token JWT
        const payload = {
            user: {
                id: user.id
            }
        };

        // Firmar el token JWT
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error("Error en el servidor:", err.message);
        res.status(500).send('Error en el servidor');
    }
};

