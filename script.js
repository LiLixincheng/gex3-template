const { createApp } = Vue;

createApp({
  data() {
    return {
      form: {
        fullName: '',
        dob: '',
        gender: '',
        totalVisitors: null,
        totalChildren: null,
        accommodation: '',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      },
      errors: {
        fullName: '',
        dob: '',
        gender: '',
        parkSelection: '',
        totalVisitors: '',
        totalChildren: '',
        accommodation: '',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      },

      generalError: '',
      places: [],
      isLoadingPlaces: true,
      placesError: '',
      selectedPlaces: [],
      accommodationOptions: [
        { value: 'none', text: 'No accommodation needed' },
        { value: 'forestView', text: 'Forest View Hotel' },
        { value: 'totoroInn', text: 'Totoro Family Inn' },
        { value: 'witchValley', text: 'Witch Valley Guesthouse' },
        { value: 'luxuryResort', text: 'Luxury Ghibli Resort' }
      ],
      showSummary: false
    };
  },
  
  computed: {
    maskedCardNumber() {
      if (!this.form.cardNumber) return '';
      let cleaned = this.form.cardNumber.replace(/\s/g, '');
      if (cleaned.length <= 4) return cleaned;
      return cleaned.slice(-4);
    }
  },

  mounted() {
    this.loadPlaces();
  },
  
  methods: {
    async loadPlaces() {
      this.isLoadingPlaces = true;
      this.placesError = '';
      try {
        const response = await fetch('ghibli_park.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.places = data;
        this.isLoadingPlaces = false;
      } catch (err) {
        this.placesError = 'Failed to load Ghibli Park data. Please check the JSON file.';
        console.error('Error loading places:', err);
        this.isLoadingPlaces = false;
      }
    },

    truncateDescription(description, maxLength = 80) {
      if (!description) return '';
      if (description.length <= maxLength) return description;
      return description.substring(0, maxLength) + '...';
    },

    isPlaceSelected(placeId) {
      return this.selectedPlaces.some(p => p.id === placeId);
    },
    
    togglePlace(place) {
      const index = this.selectedPlaces.findIndex(p => p.id === place.id);
      if (index !== -1) {
        this.selectedPlaces.splice(index, 1);
      } else {
        this.selectedPlaces.push(place);
      }
      if (this.errors.parkSelection) {
        this.errors.parkSelection = '';
      }
    },

    clearErrors() {
      this.errors = {
        fullName: '',
        dob: '',
        gender: '',
        parkSelection: '',
        totalVisitors: '',
        totalChildren: '',
        accommodation: '',
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      };
      this.generalError = '';
    },

    validateForm() {
      let isValid = true;

      if (!this.form.fullName || !this.form.fullName.trim()) {
        this.errors.fullName = 'Full name is required.';
        isValid = false;
      } else {
        this.errors.fullName = '';
      }
      
      if (!this.form.dob) {
        this.errors.dob = 'Date of birth is required.';
        isValid = false;
      } else {
        this.errors.dob = '';
      }
      
      if (!this.form.gender) {
        this.errors.gender = 'Please select a gender.';
        isValid = false;
      } else {
        this.errors.gender = '';
      }

      if (this.selectedPlaces.length === 0) {
        this.errors.parkSelection = 'Please select at least one Ghibli Park attraction.';
        isValid = false;
      } else {
        this.errors.parkSelection = '';
      }

      if (this.form.totalVisitors === null || this.form.totalVisitors === '' || this.form.totalVisitors < 1) {
        this.errors.totalVisitors = 'Total visitors must be at least 1.';
        isValid = false;
      } else {
        this.errors.totalVisitors = '';
      }
      
      if (this.form.totalChildren === null || this.form.totalChildren === '' || this.form.totalChildren < 0) {
        this.errors.totalChildren = 'Number of children cannot be negative.';
        isValid = false;
      } else {
        this.errors.totalChildren = '';
      }
      
      if (this.form.totalVisitors && this.form.totalChildren && this.form.totalChildren > this.form.totalVisitors) {
        this.errors.totalChildren = 'Number of children cannot exceed total visitors.';
        isValid = false;
      }

      if (!this.form.accommodation) {
        this.errors.accommodation = 'Please select an accommodation option.';
        isValid = false;
      } else {
        this.errors.accommodation = '';
      }
      
      if (!this.form.cardName || !this.form.cardName.trim()) {
        this.errors.cardName = 'Cardholder name is required.';
        isValid = false;
      } else {
        this.errors.cardName = '';
      }
      
      if (!this.form.cardNumber || !this.form.cardNumber.trim()) {
        this.errors.cardNumber = 'Card number is required.';
        isValid = false;
      } else {
        let cardNumClean = this.form.cardNumber.replace(/\s/g, '');
        if (!/^\d+$/.test(cardNumClean) || cardNumClean.length < 13 || cardNumClean.length > 19) {
          this.errors.cardNumber = 'Invalid card number (13-19 digits only).';
          isValid = false;
        } else {
          this.errors.cardNumber = '';
        }
      }
      
      if (!this.form.expiryDate) {
        this.errors.expiryDate = 'Expiration date is required.';
        isValid = false;
      } else {
        const today = new Date();
        const selected = new Date(this.form.expiryDate);
        const currentYearMonth = today.getFullYear() * 12 + today.getMonth();
        const selectedYearMonth = selected.getFullYear() * 12 + selected.getMonth();
        if (selectedYearMonth < currentYearMonth) {
          this.errors.expiryDate = 'Expiration date must be in the future.';
          isValid = false;
        } else {
          this.errors.expiryDate = '';
        }
      }
      
      if (!this.form.cvv) {
        this.errors.cvv = 'CVV is required.';
        isValid = false;
      } else {
        if (!/^\d{3,4}$/.test(this.form.cvv)) {
          this.errors.cvv = 'CVV must be 3 or 4 digits.';
          isValid = false;
        } else {
          this.errors.cvv = '';
        }
      }
      
      return isValid;
    },
    
    getAccommodationText(value) {
      const found = this.accommodationOptions.find(opt => opt.value === value);
      return found ? found.text : 'Not selected';
    },

    generateItinerary() {
      this.clearErrors();
      this.showSummary = false;
      
      const isFormValid = this.validateForm();
      
      if (!isFormValid) {
        this.generalError = 'There are mandatory items pending to be filled. Please complete the required fields.';
        this.showSummary = false;
      } else {
        this.generalError = '';
        this.showSummary = true;
      }
    },
    
    handleImageError(event) {
      event.target.src = 'https://via.placeholder.com/300x150?text=Image+Not+Found';
    }
  }
}).mount('#app');
