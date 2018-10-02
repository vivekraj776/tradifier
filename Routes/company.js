const express = require('express');
const router = express.Router();
const {authenticate} = require('./../middleware/authenticate.js');
const {companyModel} = require('./../Modals/companyModel.js');
const {userModel} = require('./../Modals/userModel.js');
const _ = require('lodash');
const ObjectID = require('mongodb').ObjectID;

router.post('/add',authenticate,(request,response)=>{
    var body = _.pick(request.body,['category','companyName','location','website','comapanyType']);
    console.log(body);
    var newCompany = new companyModel({
        stageOne:{
            category:body.category,
            companyName:body.companyName,
            location:body.location,
            website:body.website,
            comapanyType:body.comapanyType,
            admin:request.user._id
        }
    });
    console.log('Our new company is ->',newCompany);
    newCompany.save().then((result)=>{
        console.log('Company Registered',result);
        return userModel.findOneAndUpdate(
            {_id:request.user._id}, //find this <---
            {
                $push:{Company_id:result._id}
            }).then((user)=>{
                console.log('Data Updated',user);
                response.status(200).send(result);
        });
    },(error)=>{
        console.log('Error is ',error);
        response.status(400).send();
    }).catch((e)=>{
        response.status(400).send();
        console.log('Exception Caught is',e);
    });
});

router.get('/',authenticate,(request,response)=>{
    companyModel.find({"stageOne.admin":request.user._id}).then((companies)=>{
        if(!companes){
            return response.status(200).send();
        }
    console.log('Companies are',companies);
    response.status(200).send({companies});
    },(error)=>{
        console.log('Cannot get all companies',error);
    }).catch((e)=>{
        console.log('Exception caught',e);
    });
});

router.delete('/delete/:id',authenticate,(request,response)=>{
    var id = request.params.id;
    // if(!ObjectID.isvalid(id)){
    //     return res.status(400).send();
    // }
    companyModel.findByIdAndRemove(id).then((deletedCompany)=>{
        if(!deletedCompany){
            response.status(404).send('No such company exist, enter avaliable id');
        }
        response.status(200).send(`Deleted Company is -> ${deletedCompany}`);
    },(error)=>{
        console.log('Error while deleting',error);
        response.status(400).send();
    }).catch((e)=>{
        response.status(400).send();
    });
});

router.patch('/update/:id',authenticate,(request,response)=>{
    var body = _.pick(request.body,['category','companyName','location','website','companyType']);
    var id = request.params.id;
    console.log(body);
    companyModel.findByIdAndUpdate(id,{
        $set:{
            stageOne:body
        }
    }).then((updatedCompany)=>{
        response.status(200).send(updatedCompany);
    }).catch((e)=>{
        console.log('Exception Occured',e)
        response.status(400).send(e);
    })
});

module.exports = router;