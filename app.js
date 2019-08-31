const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./db");
const moment=require("moment");
const app = express();
app.use(bodyParser.json());
var carDetail;

var urlencodedParser = bodyParser.urlencoded({ extended: false })

//connecting to database
db.connect((err)=>{
    if(err){
        console.log("unable to connect to the database");
        process.exit(1);
    }   
    else{
        app.listen(5000,()=>{
        console.log("Connected to the database at port no 5000");
    });
}
})

//client-side hltml page
app.get('/',(req,res) =>{
    res.sendFile(path.join(__dirname,'carReq.html'));
});

//server-side html page
app.get('/parkRes',(req,res) =>{
    res.sendFile(path.join(__dirname,'parkRes.html'));

}); 

//post for park request
app.post('/',urlencodedParser,(req,res)=>{ 
    carDetail = {car:req.body.car,resTime:time,resCar:req.body.car,parkedTime:null,leaveTime:null} //prints john
    if(req.body.status=="w"){
        db.getDB().collection('parkSlot').updateOne({status:"u"},{$set:{car:req.body.car,status:"w"}},(err,result)=>{
            if(err){
                console.log(err);
            }else{
               // console.log(req.body);
            }
        });
        var time = moment().format('MMMM Do YYYY, h:mm:ss a');
        var reqCarDetail = {resTime:time,resCar:req.body.car,parkedTime:null,leaveTime:null}
        db.getDB().collection('session').insertOne(reqCarDetail,(err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log(reqCarDetail);
            }
        });
    }else if(req.body.status=="p"){
        db.getDB().collection('parkSlot').updateOne(carDetail,{$set:{status:"p"}},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log(req.body);
            }
        });
        var parktime = moment().format('MMMM Do YYYY, h:mm:ss a');
        db.getDB().collection('session').updateOne(carDetail,{$set:{parkedTime:parktime}},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log({result : result, document : result.ops[0]});
            }
        });
    }else{
        db.getDB().collection('parkSlot').updateOne(carDetail,{$set:{status:"u",car:"null"}},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log(req.body);

            }
        });
        var leavetime = moment().format('MMMM Do YYYY, h:mm:ss a');
        db.getDB().collection('session').updateOne(carDetail,{$set:{leaveTime:leavetime}},(err,result)=>{
            if(err){
                console.log(err);
            }else{
                console.log({result : result, document : result.ops[0]});
            }
        });

    }
}
);

//print the all parking data
app.get('/parkSlot',(req,res)=>{
    db.getDB().collection("parkSlot").find({}).toArray((err,documents)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(documents);
        }
    });
});

//print the one parking data
app.get('/parkSlot1',(req,res)=>{
    db.getDB().collection("parkSlot").find({"car":carDetail}).toArray((err,documents)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(documents);
        }
    });
});


//resenting all the parking data
app.put('/reset',(req,res) =>{
    // const parkSlotId = req.params.id;
    // const userInput = req.body;
    db.getDB().collection('parkSlot').updateMany({},{$set:{status:"u",car:"null"}},{returnOriginal:false},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json(result);
        }
    });
});

//adding parking slot
app.post('/add',(req,res) =>{
    const userInput = req.body;
    db.getDB().collection('parkSlot').insertOne(userInput,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json({result : result, document : result.ops[0]});
        }
    });
});

//deleating the parking slot
app.delete('/:id',(req,res) =>{
    const parkSlotId = req.params.id;
    
    db.getDB().collection('parkSlot').findOneAndDelete({_id:db.getPrimaryKey(parkSlotId)},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json(result);
        }
    });
});

//updating the data6
app.put('/:id',(req,res) =>{
    const parkSlotId = req.params.id;
    const userInput = req.body;

    db.getDB().collection('parkSlot').findOneAndUpdate({_id:db.getPrimaryKey(parkSlotId)},{$set:{status:userInput.status}},{returnOriginal:false},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json(result);
        }
    });
});

//add session
app.post('/addsession',(req,res) =>{
    const userInput = req.body;
    db.getDB().collection('session').insertOne(userInput,(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json({result : result, document : result.ops[0]});
        }
    });
});

//deleating the session
app.delete('/session/:id',(req,res) =>{
    const sessionId = req.params.id;    
    db.getDB().collection('session').findOneAndDelete({_id:db.getPrimaryKey(sessionId)},(err,result)=>{
        if(err){
            console.log(err);
        }else{
            res.json(result);
        }
    });
});

//print the all session
app.get('/session',(req,res)=>{
    db.getDB().collection("session").find({}).toArray((err,documents)=>{
        if(err){
            console.log(err);
        }
        else{
            res.send(documents);
        }
    });
});
