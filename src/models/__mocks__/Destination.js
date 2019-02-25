const Destination = {
    findById: (id) => ({ 
        select: () => {
            switch (id) {
                case 1: return Promise.resolve({ _id: 1, nameEn: 'First', countryEn: 'Wonderland', weatherSparkId: '11111', weatherSparkName: 'Weather-First' });
                case 2: return Promise.resolve({ _id: 2, nameEn: 'Second', countryEn: 'Wonderland', weatherSparkId: '22222' });
                case 3: return Promise.resolve({ _id: 3, nameEn: 'Third', countryEn: 'Wonderland', weatherSparkId: '33333', weatherSparkName: 'Weather-Third' });
                case 4: return Promise.resolve({ _id: 4, nameEn: 'Fourh', countryEn: 'Wonderland', weatherSparkId: '444444' });
            }
            }
    })
};

module.exports = Destination;