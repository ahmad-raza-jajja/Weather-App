class WeatherApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadLastSearchedCity();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('errorMessage');
        this.weatherCard = document.getElementById('weatherCard');
        
        // Weather elements
        this.cityName = document.getElementById('cityName');
        this.country = document.getElementById('country');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temp = document.getElementById('temp');
        this.description = document.getElementById('description');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.pressure = document.getElementById('pressure');
        this.windSpeed = document.getElementById('windSpeed');
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Clear error when user starts typing
        this.cityInput.addEventListener('input', () => {
            this.hideError();
        });
    }

    async handleSearch() {
        const city = this.cityInput.value.trim();
        
        if (!city) {
            this.showError('Please enter a city name');
            this.cityInput.focus();
            return;
        }

        await this.fetchWeather(city);
    }

    async fetchWeather(city) {
        try {
            this.showLoading();
            this.hideError();
            this.hideWeather();

            const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            this.hideLoading();

            if (data.success) {
                this.displayWeather(data.data);
                this.saveLastSearchedCity(city);
            } else {
                this.showError(data.message || 'Failed to fetch weather data');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            this.hideLoading();
            this.showError('Unable to connect to weather service. Please check your internet connection and try again.');
        }
    }

    displayWeather(weatherData) {
        // Update location
        this.cityName.textContent = weatherData.city;
        this.country.textContent = weatherData.country;

        // Update temperature
        this.temp.textContent = weatherData.temperature;

        // Update description
        this.description.textContent = weatherData.description;

        // Update weather icon
        this.weatherIcon.src = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;
        this.weatherIcon.alt = weatherData.description;

        // Update details
        this.feelsLike.textContent = `${weatherData.feelsLike}°C`;
        this.humidity.textContent = `${weatherData.humidity}%`;
        this.pressure.textContent = `${weatherData.pressure} hPa`;
        this.windSpeed.textContent = `${weatherData.windSpeed} m/s`;

        this.showWeather();
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.searchBtn.disabled = true;
        this.searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    }

    hideLoading() {
        this.loading.style.display = 'none';
        this.searchBtn.disabled = false;
        this.searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.error.style.display = 'flex';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.error.style.display = 'none';
    }

    showWeather() {
        this.weatherCard.style.display = 'block';
    }

    hideWeather() {
        this.weatherCard.style.display = 'none';
    }

    saveLastSearchedCity(city) {
        try {
            localStorage.setItem('lastSearchedCity', city);
        } catch (e) {
            // Ignore localStorage errors
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadLastSearchedCity() {
        try {
            const lastCity = localStorage.getItem('lastSearchedCity');
            if (lastCity) {
                this.cityInput.value = lastCity;
                // Optionally auto-search the last city
                // this.fetchWeather(lastCity);
            }
        } catch (e) {
            // Ignore localStorage errors
            console.warn('Could not load from localStorage:', e);
        }
    }
}

// Initialize the weather app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add some utility functions for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add focus effect to search input
    const cityInput = document.getElementById('cityInput');
    
    cityInput.addEventListener('focus', () => {
        cityInput.parentElement.classList.add('focused');
    });
    
    cityInput.addEventListener('blur', () => {
        cityInput.parentElement.classList.remove('focused');
    });

    // Add keyboard shortcut (Ctrl/Cmd + K to focus search)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            cityInput.focus();
            cityInput.select();
        }
    });
});