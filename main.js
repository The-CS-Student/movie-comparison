const puppeteer = require('puppeteer');
var express = require("express")
var bodyParser = require("body-parser")
var app = express()
var urlencodeParser = bodyParser.urlencoded({extended:false})
app.set("view engine","ejs")
let movies = [];
var status = 0;

async function run (url) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            let urls = await page.evaluate(() => {
                var title;
                var rating;
                var count;
                var img;
                var items = document.querySelectorAll(':first-of-type div.title_wrapper > h1');
                items.forEach((item) =>{
                	title = item.innerText;
                });
                var items = document.querySelectorAll(':first-of-type span[itemprop=ratingValue]');
                items.forEach((item) =>{
                	rating = item.innerText;
                });
                var items = document.querySelectorAll(':first-of-type span[itemprop=ratingCount]');
                items.forEach((item) =>{
                	count = item.innerText;
                });
                var items = document.querySelectorAll(':first-of-type div.poster img');
                items.forEach((item) =>{
                	img = item.getAttribute('src');
                });
                var results = {Title:title,Img:img,Rating:rating,Count:count,Score:"None"};


                
                return results;
            })

            browser.close();
            movies.push(urls);
            
            
        
    
}
function calculate(array){
	var W = 0.5;//R>1
	for(var i = 0;i<array.length;i++){
		array[i].Score = W*parseInt(array[i].Rating,10)*Math.log(parseInt(array[i].Count.replace(/\,/g,'')));
	}
	array = quickSort(array, 0, array.length - 1);
	return array.reverse();


}
function swap(items, leftIndex, rightIndex){
    var temp = items[leftIndex];
    items[leftIndex] = items[rightIndex];
    items[rightIndex] = temp;
}
function partition(items, left, right) {
    var pivot   = items[Math.floor((right + left) / 2)].Score, //middle element
        i       = left, //left pointer
        j       = right; //right pointer
    while (i <= j) {
        while (items[i].Score < pivot) {
            i++;
        }
        while (items[j].Score > pivot) {
            j--;
        }
        if (i <= j) {
            swap(items, i, j); //swap two elements
            i++;
            j--;
        }
    }
    return i;
}
function quickSort(items, left, right) {
    var index;
    if (items.length > 1) {
        index = partition(items, left, right); //index returned from partition
        if (left < index - 1) { //more elements on the left side of the pivot
            quickSort(items, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            quickSort(items, index, right);
        }
    }
    return items;
}
// first call to quick sort

app.get("/",function(req,res){
	console.log(movies);
	res.render("main",{movies:movies,status:status});
})
app.post('/submit',urlencodeParser,  async (req, res)=> {

	await run(req.body["IMDB Link"]);

	res.redirect('/');

})
app.post('/submitSore',urlencodeParser,  async (req, res)=> {

	

	res.redirect('/');

})
app.post('/submitScore',urlencodeParser,  async (req, res)=> {

	movies = calculate(movies)
	status = 1;
	res.redirect('/');

})
app.listen(3000)