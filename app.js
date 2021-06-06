const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const _ = require("lodash")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
mongoose.connect("mongodb+srv://admin:test@cluster0.z2m8d.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true ,useUnifiedTopology: true,useFindAndModify: false ,useFindAndModify: false});

const itemSchema={name:String}
const Item=mongoose.model("item",itemSchema)

const listSchema={name:String,items:[itemSchema]}
const List = mongoose.model("customList",listSchema)



const code=new Item({name:"Enter your task Then click the plus button"})          //create default things
const decode=new Item({name:"To delete it check it"})
const debug=new Item({name:"Be happy :)"})
var defaultItems=[code,decode,debug];
//var workthings=[];
app.set('view engine', 'ejs');
var today = new Date()
var currentDay = today.getDay()
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var day=today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016

app.get('/', (req, res) => {
  Item.find({},function(err,results){
  if(results.length===0){

    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err)
      }
      else{
        console.log("just pushed")
      }
    })

  }
  res.render('list', {Title: day , newThing:results});
  })
});

app.get("/:customListname",function(req,res){
      var customListName=_.lowerCase(req.params.customListname)
      List.findOne({name:customListName},function(err,foundList){ 
        if(!err){
          if(!foundList){
            console.log("new")
            const list = new List({
              name:customListName,
              items:defaultItems
            })
            list.save()
            res.redirect("/"+customListName)
          }
          else{
            res.render("list",{Title:foundList.name ,newThing:foundList.items})
          }
        }
        else{
          console.log(err)
        }
       })
})
 
app.post("/del",function(req,res){
  var itemsTobeDeleted=req.body.checker
  var Page = req.body.name
  if(Page===day){
      Item.findByIdAndRemove(itemsTobeDeleted,function(err){
        if(err){
          console.log(err)
        }
        else{
          console.log("popped")
        }
      })
      res.redirect("/")
  }
  else{


    List.findOneAndUpdate({name:Page},{$pull:{items:{_id:itemsTobeDeleted}}},function(err,result){
      if(!err){
        res.redirect("/"+Page)
      }
    })
  }
    

})
app.post("/",function(req, res){
    
    const listName = req.body.list
    const itemName =req.body.newItem
    if(itemName!=""){
    const item=new Item({name:itemName});
    if(listName===day){
      item.save()
      res.redirect("/")
    }
    else{
      //console.log(itemName)
      List.findOne({name:listName},function(err,found){
        found.items.push(item)
        found.save()
        res.redirect("/"+listName)

      })
    }
  }
})

app.get("/me/about",function(req, res){
  res.render("about")
})

let port=process.env.PORT
if (port==null||port==""){
  port=3000
}

app.listen(port, function() {
  console.log("server up")
})
