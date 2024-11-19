
var express = require('express');
var app = express();
var path = require('path');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// use res.render to load up an ejs view file

const GTAG = "xxxxxx";

// Home page 
app.get('/', function(req, res) {
    res.render('pages/index', { title: 'DogeSnacks - A launchpad for those smaller projects', description: 'DogeSnacks is a decentralized and permissionless crowdfunding platform that makes raising capital accessible, transparent, fair and above all tasty. The launchpad gives emerging DeFI projects owners the power to distribute tokens, raise liquidity, and pledge security to their investors.', canonical: '', gtag: GTAG });

});

// About page 
app.get('/about', function(req, res) {
    res.render('pages/about', { title: 'About - DogeSnacks', description: 'The DogeSnacks-protocol executes token allocation, liquidity pool creation, liquidity locking, and direct listing on Uniswap autonomously.', canonical: 'about', gtag: GTAG });
});

// Snacks page 
app.get('/snacks', function(req, res) {
    const balance = 42000000;
    res.render('pages/snacks', { title: 'Snacks - DogeSnacks', description: '$SNACKS is the community token for the DogeSnacks IDO Protocol, a decentralized crowdfunding transaction protocol, with an innovative deflationary mechanism that includes a redistribution and burning system that rewards all its holders.', canonical: 'snacks', gtag: GTAG, gtsBalance: balance });
});

// Snacks History page 
app.get('/snacks-history', function(req, res) {
    res.render('pages/snacks-history', { title: 'Snacks History - DogeSnacks', description: 'Snacks History', canonical: 'snacks-history', gtag: GTAG });
});

// Launchpad page 
app.get('/launchpad', function(req, res) {
    res.render('pages/launchpad', { title: 'Launchpad - DogeSnacks', description: 'DogeSnacks is a decentralized and permissionless crowdfunding platform that enables emerging DeFI projects the ability to distribute tokens, raise liquidity, and promise safety to investors.', canonical: 'launchpad', gtag: GTAG });
});

// Roadmap page 
app.get('/roadmap', function(req, res) {
    res.render('pages/roadmap', { title: 'Roadmap - DogeSnacks', description: 'Here you will find all the features that have been successfully executed and what is still upcoming for 2021.', canonical: 'roadmap', gtag: GTAG });
});

// Help page 
app.get('/help', function(req, res) {
    res.render('pages/help', { title: 'Help - DogeSnacks', description: 'DogeSnacks Help and Protocol Functionalities', canonical: 'help', gtag: GTAG });
});

// Create Listing page 
app.get('/createlisting', function(req, res) {
    res.render('pages/createlisting', { title: 'Create IDO Listing - DogeSnacks', description: 'Customize the terms of your Initial DEX Offering and prepare for launch. The DogeSnacks-protocol executes token allocation, liquidity pool creation, liquidity locking, and direct listing on Uniswap autonomously. Everything ready for public trading', canonical: 'createlisting', gtag: GTAG });
});

// IDO Detail page 
app.get('/ido-dogesnacks-0', function(req, res) {
    res.render('pages/ido-detail', { title: 'DogeSnacks', description: '$SNACKS is the community token for the DogeSnacks IDO Protocol, a decentralised crowdfunding transaction protocol, with an innovative deflationary mechanism that includes a redistribution and burning system that rewards all its holders', canonical: 'ido-dogesnacks-0', gtag: GTAG });
});

// 404 page 
app.get('*', function(req, res){
  res.render('pages/404', {title: '404 - Please check the URL', description: 'Please check the URL', canonical: 'we-lost-you-there'});
});



app.listen(8081);
console.log('8081 is the magic port');