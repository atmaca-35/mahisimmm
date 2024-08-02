document.addEventListener('DOMContentLoaded', async () => {
  const searchBox = document.getElementById('searchBox');
  const searchIcon = document.getElementById('searchIcon');
  const suggestionsDiv = document.getElementById('suggestions');
  const wordCountMessage = document.getElementById('wordCountMessage');
  const resultDiv = document.getElementById('result');
  const themeToggle = document.getElementById('themeToggle');
  const randomButton = document.getElementById('randomButton');
  const specialKeys = document.querySelectorAll('.special-key');

  let dictionaryData = {};

  // Sözlük verilerini yükleme
  try {
    const response = await fetch('semantic.json');
    dictionaryData = await response.json();
    updateWordCountMessage();
  } catch (error) {
    console.error('Error fetching dictionary:', error);
    wordCountMessage.textContent = 'Error loading dictionary.';
  }

  // Öneri Kutusunu Güncelle
  function updateSuggestions() {
    const query = searchBox.value.trim().toLowerCase();
    suggestionsDiv.innerHTML = '';

    if (query.length > 0) {
      const filteredWords = Object.keys(dictionaryData)
        .filter(word => word.toLowerCase().includes(query))
        .sort();

      const ul = document.createElement('ul');
      filteredWords.forEach(word => {
        const li = document.createElement('li');
        li.innerHTML = highlightMatchingText(word, query);
        li.addEventListener('click', () => {
          searchBox.value = word;
          suggestionsDiv.innerHTML = '';
          suggestionsDiv.classList.remove('active');
          searchWord(word);
        });
        ul.appendChild(li);
      });

      suggestionsDiv.appendChild(ul);
      suggestionsDiv.classList.add('active');
    } else {
      suggestionsDiv.classList.remove('active');
    }
  }

  // Arama Fonksiyonu
  function searchWord(query) {
    resultDiv.innerHTML = '';
    wordCountMessage.style.display = 'none';

    if (!dictionaryData[query]) {
      resultDiv.innerHTML = '<h3 class="error">No results found.</h3>';
      return;
    }

    const wordDetails = dictionaryData[query];
    
    resultDiv.innerHTML = `
        <div class="word">
          <h3>${query}</h3>
          <p><i>${wordDetails.type}</i></p>
        </div>
        <p class="description"><b class='green'>I.</b> ${highlightWords(sanitizeHTML(wordDetails.description))}</p>
    `;

    // Animasyon
    resultDiv.style.animation = 'none';
    resultDiv.offsetHeight; // Tarayýcýnýn yeniden akýþa geçmesini saðlar
    resultDiv.style.animation = 'fadeIn 1s ease-in-out';
  }

  // Rastgele Kelime Gösterme
  function showRandomWord() {
    if (Object.keys(dictionaryData).length === 0) { 
      resultDiv.innerHTML = '<h3 class="error">Sözlük yüklenirken bir hata oluþtu.</h3>';
      return;
    }

    const wordKeys = Object.keys(dictionaryData);
    const randomWordKey = wordKeys[Math.floor(Math.random() * wordKeys.length)];
    searchWord(randomWordKey);
  }

  // HTML Ýçeriðini Temizleme
  function sanitizeHTML(htmlString) {
    return DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br'],
      ALLOWED_ATTR: ['href'],
    });
  }

  // Eþleþen Metinleri Vurgulama
  function highlightMatchingText(text, query) {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); 
    const regex = new RegExp(escapedQuery, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
  }

  // Özel Kelimeleri Vurgulama
  function highlightWords(text) {
    const highlightWords = ['Ottoman', 'Middle', 'Proto', 'old'];
    highlightWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      text = text.replace(regex, `<span class="highlight">${word}</span>`);
    });
    return text;
  }

  // Arama Kutusu Etkinlik Dinleyicileri
  searchBox.addEventListener('input', updateSuggestions);
  searchBox.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchWord(searchBox.value.trim().toLowerCase());
      suggestionsDiv.classList.remove('active');
    }
  });

  // Özel Karakter Butonlarý
  specialKeys.forEach(button => {
    button.addEventListener('click', () => {
      searchBox.value += button.textContent;
      updateSuggestions();
    });
  });

  // Arama Ýkonu Etkinlik Dinleyicisi
  searchIcon.addEventListener('click', () => {
    const query = searchBox.value.trim().toLowerCase();
    if (query !== '') {
      searchWord(query);
    }
  });

  // Tema Deðiþtirme
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    themeToggle.innerHTML = document.body.classList.contains('dark-mode') 
      ? '<img src="sun.ico" alt="Light Mode Toggle" />'
      : '<img src="moon.ico" alt="Dark Mode Toggle" />';
  });

  // Rastgele Buton Etkinlik Dinleyicisi
  randomButton.addEventListener('click', showRandomWord);

  // Kelime Sayýsýný Güncelleme
  function updateWordCountMessage() {
    const wordCount = Object.keys(dictionaryData).length;
    wordCountMessage.textContent = `Currently, there are ${wordCount} words and suffixes in our dictionary. Our dictionary includes the meanings of the words, their origins, the suffixes they take, and the functions of those suffixes.`;
    wordCountMessage.style.fontFamily = 'Arial, sans-serif';
    wordCountMessage.style.fontWeight = 'bold';
  }
});
