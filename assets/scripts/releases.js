const getToken = async (code) => {
    const url = 'https://accounts.spotify.com/api/token';
    const idClient = '652868d51ddd4e478820683275bc95b6';
    const redirectUri = 'http://localhost/SpotifyValeria-front/assets/modules/inicio.html';
    let codeVerifier = localStorage.getItem('code_verifier');

    if (!code) {
        console.error('No se ha encontrado el código de autorización en el localStorage');
        return;
    }

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: idClient,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(url, payload);
    const response = await body.json();

    localStorage.setItem('access_token', response.access_token);
    return response.access_token;
}

document.addEventListener('DOMContentLoaded', async function () {
    const accessToken = localStorage.getItem('access_token');

    try {
        // Verificar si ya hay un token de acceso en el almacenamiento local
        if (!accessToken) {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                // Si hay un código en la URL, obtener el token de acceso
                const tokenSpotify = await getToken(code);
                // Realizar solicitud a la API de Spotify para obtener nuevos lanzamientos
                const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
                    headers: {
                        'Authorization': `Bearer ${tokenSpotify}`
                    }
                });
                const data = await response.json();

                // Procesar la respuesta y mostrar los nuevos lanzamientos
                const newReleasesList = document.getElementById('new-releases-list');
                data.albums.items.forEach(album => {
                    const albumCard = document.createElement('div');
                    albumCard.classList.add('card');

                    const albumImage = document.createElement('img');
                    albumImage.src = album.images[0].url;
                    albumImage.alt = album.name;

                    const albumName = document.createElement('h2');
                    albumName.textContent = capitalizeFirstLetter(album.name);

                    const artistName = document.createElement('p');
                    artistName.textContent = capitalizeFirstLetter(album.artists[0].name);

                    const releaseDate = document.createElement('p');
                    releaseDate.textContent = "Lanzamiento: " + capitalizeFirstLetter(album.release_date);

                    const spotifyLink = document.createElement('a');
                    spotifyLink.href = album.artists[0].external_urls.spotify;
                    spotifyLink.textContent = 'Ver en Spotify';
                    spotifyLink.classList.add('spotify-link');
                    spotifyLink.target = "_blank";
                    spotifyLink.rel = "noopener noreferrer";

                    albumCard.appendChild(albumImage);
                    albumCard.appendChild(albumName);
                    albumCard.appendChild(artistName);
                    albumCard.appendChild(releaseDate);
                    albumCard.appendChild(spotifyLink);

                    newReleasesList.appendChild(albumCard);
                });
            }
        } else {
            // Realizar solicitud a la API de Spotify para obtener nuevos lanzamientos
            const response = await fetch('https://api.spotify.com/v1/browse/new-releases', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();

            // Procesar la respuesta y mostrar los nuevos lanzamientos
            const newReleasesList = document.getElementById('new-releases-list');
            data.albums.items.forEach(album => {
                const albumCard = document.createElement('div');
                albumCard.classList.add('card');

                const albumImage = document.createElement('img');
                albumImage.src = album.images[0].url;
                albumImage.alt = album.name;

                const albumName = document.createElement('h2');
                albumName.textContent = capitalizeFirstLetter(album.name);

                const artistName = document.createElement('p');
                artistName.textContent = capitalizeFirstLetter(album.artists[0].name);

                const releaseDate = document.createElement('p');
                releaseDate.textContent = "Lanzamiento: " + capitalizeFirstLetter(album.release_date);

                const spotifyLink = document.createElement('a');
                spotifyLink.href = album.artists[0].external_urls.spotify;
                spotifyLink.textContent = 'Ver en Spotify';
                spotifyLink.classList.add('spotify-link');
                spotifyLink.target = "_blank";
                spotifyLink.rel = "noopener noreferrer";

                albumCard.appendChild(albumImage);
                albumCard.appendChild(albumName);
                albumCard.appendChild(artistName);
                albumCard.appendChild(releaseDate);
                albumCard.appendChild(spotifyLink);

                newReleasesList.appendChild(albumCard);
            });
        }
    } catch (error) {
        console.error('Error al obtener nuevos lanzamientos:', error);
        Swal.fire({
            position: "top-center",
            icon: "error",
            title: "Error al obtener nuevos lanzamientos",
            showConfirmButton: false,
            timer: 1500
        });
    }
});


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
