import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getSalutations () {
    const response = await Vue.http({
      url: ApiUrls.Data.SalutationList,
      method: 'GET',
    });
    return response.data.salutations;
  },

  async getCountries () {
    // const response = await Vue.http({
    //   url: ApiUrls.Data.CountryList,
    //   method: 'GET',
    // });
    // return response.data.countries;
    return [
      { code: 'DE', name: 'Germany' },
      { code: 'US', name: 'United States of America' },
    ];
  },

  async getOccupations () {
    // const response = await Vue.http({
    //   url: ApiUrls.Data.OccupationList,
    //   method: 'GET',
    // });
    // return response.data.occupations;
    return [
      { code08: '1234', code88: '123', name: 'Developer' },
      { code08: '5523', code88: '363', name: 'Engineer' },
    ];
  },

  async getLanguages () {
    // const response = await Vue.http({
    //   url: ApiUrls.Data.LanguageList,
    //   method: 'GET',
    // });
    // return response.data.languages;
    return [
      { lang_code: 'DE', lang_name: 'German' },
      { lang_code: 'EN', lang_name: 'English' },
    ];
  },
};
