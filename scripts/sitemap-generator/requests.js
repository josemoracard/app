/* eslint-disable no-await-in-loop */
const { default: axios } = require('axios');
require('dotenv').config({
  path: '.env.production',
});

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const PRISMIC_API = process.env.PRISMIC_API || 'https://your-prismic-repo.cdn.prismic.io/api/v2';
const PRISMIC_REF = process.env.PRISMIC_REF || 'Y-EX4MPL3R3F';

const getPrismicPages = () => {
  const data = axios.get(`${PRISMIC_API}/documents/search?ref=${PRISMIC_REF}&type=page&lang=*`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Prismic pages');
    });
  return data;
};

const getTechonologyAssets = async (slug) => {
  const resp = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?limit=9000&technologies=${slug}`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Technology Assets');
    });
  return resp;
};

const getReadPages = () => {
  const resp = axios.get(
    `${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`,
  )
    .then((res) => res.data)
    .catch(() => {
      console.error('SITEMAP: Error fetching Read pages');
    });
  return resp;
};

const getAsset = async (type) => {
  const limit = 100;
  let offset = 0;
  let allResults = [];

  let results = await axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=${type}&limit=${limit}&offset=${offset}`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error(`SITEMAP: Error fetching ${type.toUpperCase()} pages`);
      return [];
    });

  while (results.length > 0) {
    allResults = allResults.concat(results);
    offset += limit;

    results = await axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=${type}&limit=${limit}&offset=${offset}`)
      .then((res) => res.data.results)
      .catch(() => {
        console.error(`SITEMAP: Error fetching ${type.toUpperCase()} pages`);
        return [];
      });
  }

  return allResults;
};

const getLandingTechnologies = () => {
  const technologies = axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000`, {
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  })
    .then((res) => {
      const formatedWithAssets = res.data.results.map(async (tech) => {
        const assets = await getTechonologyAssets(tech?.slug);
        return { ...tech, assets };
      });

      const technologiesWithAssets = Promise.all(formatedWithAssets).then(
        (data) => data.filter((tech) => tech?.assets?.length > 0),
      );
      return technologiesWithAssets;
    })
    .catch(() => {
      console.error('SITEMAP: Error fetching Technologies pages');
    });

  return technologies;
};

module.exports = {
  getAsset,
  getPrismicPages,
  getReadPages,
  getLandingTechnologies,
  getTechonologyAssets,
};
