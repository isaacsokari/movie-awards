const form = document.querySelector('form');
const searchTerm = document.querySelector('#movie');
const info = document.querySelector('#info');

const movieList = document.querySelector('#movieList');
const nomineeList = document.querySelector('#nominationsList');

let nominees = JSON.parse(localStorage.getItem('awardNominees')) || [];

const fillNomineeList = () => {
  let html = ``;

  nominees.forEach((movie) => {
    const { title, imdbId, year, imgSrc } = movie;

    html += `
    <li class="movie" data-title="${title}" data-year="${year}" data-imdb-id="${imdbId}" >
    <img src="${imgSrc}" alt="${title}"  />
    <div class="movie__details">
      <h3>${title}</h3>
      <p>${year}</p>
      <button onclick="withdrawNomination(this)" class="remove">Remove</button>
    </div>
  </li>
    `;
  });

  nomineeList.innerHTML = html;
};

fillNomineeList();

const nominate = (e) => {
  if (nominees.length >= 5) {
    return alert('You can only nominate five movies.');
  }

  const movie = e.closest('.movie');
  const { title, imdbId, year } = movie.dataset;
  const imgSrc = movie.querySelector('img').src;

  if (nominees.filter((nominee) => nominee.imdbId === imdbId).length === 0) {
    nominees.push({ title, imdbId, year, imgSrc });
    localStorage.setItem('awardNominees', JSON.stringify(nominees));

    let clone = movie.cloneNode(true);
    let button = clone.querySelector('button');
    button.innerText = 'Remove';
    button.classList.add('remove');

    button.setAttribute('onclick', 'withdrawNomination(this)');

    nomineeList.appendChild(clone);
    e.disabled = true;
  }
};

const withdrawNomination = (e) => {
  const movie = e.closest('.movie');
  const { imdbId } = movie.dataset;

  nominees = nominees.filter((nominee) => nominee.imdbId !== imdbId);

  localStorage.setItem('awardNominees', JSON.stringify(nominees));

  nomineeList.removeChild(movie);
  // enable button in results
  movieList.querySelector(
    `.movie[data-imdb-id="${imdbId}"] button`
  ).disabled = false;
};

const getMovies = async () => {
  const url = `https://www.omdbapi.com/?apikey=afff5766&s=${encodeURIComponent(
    searchTerm.value.trim()
  )}`;

  if (!searchTerm.value.trim()) return;

  try {
    const res = await fetch(url);
    const data = await res.json();

    let moviesHtml = '';

    if (data.Search && data.Search.length) {
      data.Search.forEach((movie) => {
        const { Title, Year, imdbID, Poster } = movie;
        moviesHtml += `
      <li class="movie" data-title="${Title}" data-year="${Year}" data-imdb-id="${imdbID}">
      ${Poster !== 'N/A' ? `<img src="${Poster}" alt="${Title}"/>` : ''}    
      <div class="movie__details">
        <h3>${Title}</h3>
        <p>${Year}</p>
        <button onclick="nominate(this)">Nominate</button>
      </div>
    </li>
      `;
      });

      info.innerText = `Showing results for "${searchTerm.value.trim()}".`;
      info.classList.remove('empty');
      movieList.innerHTML = moviesHtml;
    } else {
      info.classList.add('empty');
      movieList.innerHTML = '';
      info.innerText = `No results for "${searchTerm.value.trim()}" found`;
    }
  } catch (error) {
    console.error(error);
  }
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.clear();
  getMovies();
});
