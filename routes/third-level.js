var express = require('express');
var router = express.Router();
const contentful = require('contentful')

// contentful setup
const SPACE_ID = 'tjuqohmohv21'
const ACCESS_TOKEN = 'e3070ba893e6549dfd7a4228bb8d2293da869a54c0285bd0b83d1b3f92570b70'

const client = contentful.createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN
})

router.get('/:firstCategory/:secondCategory', function(req, res, next) {

  // get all first level categories
  client.getEntries({
    'locale': req.query["lang"],
    'limit': 1000
  })
  .then(function (entries) {

    let categoryInfos = entries.items.find(function(entry){
      return entry.sys.contentType.sys.id == 'secondCategory' && entry.sys.id == req.params["secondCategory"]
    }).fields

    // filter the offerings  out of all entries fetched
    let entriesFilteredForCategories = entries.items.filter(function(entry){
      return entry.sys.contentType.sys.id == 'offering'
    })

    let allOfferings = entriesFilteredForCategories.map((offering) => {

      try{
        return {
          name: offering.fields.title,
          firstCategories: offering.fields.nd1stCategory,
          secondCategories: offering.fields.nd2ndCategory,
          /*institution: offering.fields.institution,*/
          description: (offering.fields.description)? offering.fields.description.split(/\n|\s\n/).join("<br>\n") + "<br>" : null,
          picture: offering.fields.picture ? offering.fields.picture.fields.file.url : offering.fields.picture,
          openingHours: offering.fields.openingHours ?moffering.fields.openingHours.replace(";", "<br>") : null,
          contactPersonPhoneNumber: offering.fields.contactPersonPhoneNumber,
          contactPersonEmailAddress: offering.fields.contactPersonEmailAddress,
          website: offering.fields.website,
          contactPerson: offering.fields.ansprechpartner,
          address: offering.fields.adresse
        }
      }
      catch(error){
        console.log("Following entry errored:")
        console.log(offering)
        console.log(offering.fields)
        console.log(error)
      }
    })

    let offerings = allOfferings.filter(function(offering){
      try{
        // check if first and second categories have been filled
        if (offering.secondCategories){

          let validSecondCategories = offering.secondCategories.map((offering) => {return offering.sys.id});

          return validSecondCategories.includes(req.params["secondCategory"]);
          }
      }
      catch(error){
        console.log(error)
      }

    }).sort(function(a, b){
      return a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1
    })

    // filter the langages out of all entries fetched
    entriesFilteredForLanguages = entries.items.filter(function(entry){
      return entry.sys.contentType.sys.id == 'language'
    })

    // filter the languages out of all entries fetched
    let languages = entriesFilteredForLanguages.map((language) => {

      // make de and en appear first
      if(language.fields.shortForm == "de"){
        language.order = 1;

      }
      else if(language.fields.shortForm == "en"){
        language.order = 2;
      }
      else {
        language.order = 3
      }

      // for some reason Contentful fucks with Somali and delivers the full name as the language code, so we are changing it manually now
      if(language.fields.languageCode == "Somali"){
        language.fields.languageCode = "so"
      }

      return {
        name: language.fields.name,
        short: language.fields.shortForm,
        code: language.fields.languageCode,
        order: language.order
      }
    }).sort(function(x,y){ return x.order <= y.order ? 1 : -1});

     // filter the front page elements out of all entries fetched
     entriesFilteredForFrontPage = entries.items.filter(function(entry){
      return entry.sys.contentType.sys.id == 'frontPage'
    })

    let frontPage = entriesFilteredForFrontPage.map((element) => {
      return {
        title: element.fields.title,
        description: element.fields.description,
        coverpicture: element.fields.coverpicture.fields.file.url
      }
    })[0]

    // filter only imprint out of all entries fetched
    entriesFilteredForImprint = entries.items.filter(function(entry){
       return entry.sys.contentType.sys.id == 'imprint'
    })

    let imprint = entriesFilteredForImprint.map((imprint) => {
      return {
        content: imprint.fields.content,
        title: imprint.fields.titlte
      }
    })[0]

    res.render('third', {
       imprint: imprint,
       offerings: offerings,
       frontPage:frontPage,
       languages:languages,
       chosenLang: req.query["lang"],
       referer: req.headers.referer,
       color: req.query["color"],
       category: categoryInfos
      });
  }).catch(err => {
    console.log(err);
  })
});

/*client.getContentTypes()
.then((response) => console.log(response.items))
.catch(console.error)*/

module.exports = router;
