const clientId = '3bee0ed70de94cd0adda8690609f88a3';
const redirectUri = 'http://localhost/SpotifyValeria-front/assets/modules/inicio.html';

const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")


document.addEventListener('DOMContentLoaded', async function () {

    const currentPage = window.location.pathname;
    const token = localStorage.getItem('token');
    const accessToken = localStorage.getItem('access_token');

    if (token && accessToken && currentPage !== '/SpotifyValeria-front/assets/modules/inicio.html') {
        // Si hay un token y no estamos en la página de inicio,
        // redirigimos a la página de inicio.
        window.location.href = 'http://localhost/SpotifyValeria-front/assets/modules/inicio.html';

    } else if (!token && !accessToken && currentPage !== '/SpotifyValeria-front/index.html') {
        // Si no hay un token y no estamos en la página de inicio,
        // redirigimos a la página de inicio.
        window.location.href = 'http://localhost/SpotifyValeria-front/index.html';
    }

    // Decodificar el token JWT
    if (token) {
        const decodedToken = jwt_decode(token);
        const userName = decodedToken.name;

        // Actualizar el HTML con la información del usuario
        const usernameDisplay = document.getElementById('username-display');
        usernameDisplay.querySelector('.username').textContent = userName;
    }

    // Obtener referencias a los elementos del formulario
    const registerForm = document.querySelector('#register-form');
    const loginForm = document.querySelector('#login-form');


    if (registerForm) {

        // Agregar un event listener para el formulario de registro
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener los valores de los campos de entrada
            const name = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            try {
                await axios.post('http://127.0.0.1:8000/api/auth/do_register', { name, email, password });
                Swal.fire({
                    position: "top-center",
                    icon: "success",
                    title: "Registro exitoso",
                    showConfirmButton: false,
                    timer: 1500
                });

            } catch (error) {
                console.error(error);
                Swal.fire({
                    position: "top-center",
                    icon: "error",
                    title: "Fallo al registrar el usuario",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });

    }
    if (loginForm) {

        // Agregar un event listener para el formulario de inicio de sesión
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener los valores de los campos de entrada
            const user = loginForm.querySelector('input[type="email"]').value;
            const pwd = loginForm.querySelector('input[type="password"]').value;

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/auth/do_login', { user, pwd });

                // Guardar el token en el almacenamiento local
                const token = response.data.data.token;
                localStorage.setItem('token', token);

                Swal.fire({
                    position: "top-center",
                    icon: "success",
                    title: "Sesión Iniciada",
                    showConfirmButton: false,
                    timer: 1500
                });
                const generateRandomString = (length) => {
                    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const values = crypto.getRandomValues(new Uint8Array(length));
                    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
                }

                const codeVerifier = generateRandomString(64);

                const sha256 = async (plain) => {
                    const encoder = new TextEncoder()
                    const data = encoder.encode(plain)
                    return window.crypto.subtle.digest('SHA-256', data)
                }


                const base64encode = (input) => {
                    return btoa(String.fromCharCode(...new Uint8Array(input)))
                        .replace(/=/g, '')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_');
                }

                const hashed = await sha256(codeVerifier)
                const codeChallenge = base64encode(hashed);

                // generated in the previous step
                localStorage.setItem('code_verifier', codeVerifier);

                const params = {
                    response_type: 'code',
                    client_id: clientId,
                    scope,
                    code_challenge_method: 'S256',
                    code_challenge: codeChallenge,
                    redirect_uri: redirectUri,
                }

                authUrl.search = new URLSearchParams(params).toString();
                window.location.href = authUrl.toString();

            } catch (error) {
                console.error(error);
                Swal.fire({
                    position: "top-center",
                    icon: "error",
                    title: "Fallo al iniciar sesión",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    }
});

function logout() {
    try {
        const tokenAuth = localStorage.getItem('token');

        const config = {
            headers: {
                'Authorization': `Bearer ${tokenAuth}`,
            },
        };
        axios.post('http://127.0.0.1:8000/api/auth/logout', config);

        // Eliminar el token del localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('code_verifier');
        localStorage.removeItem('access_token');
        localStorage.clear();

        Swal.fire({
            position: "top-center",
            icon: "success",
            title: "Sesión Cerrada",
            showConfirmButton: false,
            timer: 1500
        });

        setTimeout(() => {
            // Redirigir al usuario a la página de inicio
            window.location.href = '/SpotifyValeria-front/index.html';
        }, 3000);

    } catch (error) {
        console.error(error);
        Swal.fire({
            position: "top-center",
            icon: "error",
            title: "Fallo al cerrar sesión",
            showConfirmButton: false,
            timer: 1500
        });
    }
}
