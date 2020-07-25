var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
var moment = require("moment"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose");

router.use(expressSanitizer());
router.use(methodOverride("_method"));



var Blog = require('../models/blog');

router.get('/',isLoggedIn,function(req,res,next)
{
    req.session.blog = true;
    Blog.find({},function(err,blogs)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.render('blog/index', {
                title: 'Blogs',
                blogs: blogs
            });
        }
    })
})

router.post('/', function(req,res,next)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog)
    {
        if(err)
        {
            res.render("new");
        }
        else
        {
            res.redirect("/");
        }
    })
})

router.get('/new', isLoggedIn ,function(req,res,next)
{
    res.render('blog/new',{
        title: 'New Blog'
    });
})

router.get("/:id",function(req,res)
{
    req.session.blog = true;
    Blog.findById(req.params.id, function(err,foundBlog)
    {
        if(err)
        {
            res.redirect("/");
        }
        else{
            res.render("blog/show",{
                blog: foundBlog,
                title: foundBlog.title
            })
        }
    })
})

router.get("/:id/edit",function(req,res)
{
    req.session.blog = true;
    Blog.findById(req.params.id,function(err, foundBlog)
    {
        if(err)
        {
            res.redirect("/");
        }
        else
        {
            res.render("blog/edit",{
                title: "Edit " + foundBlog.title ,
                blog: foundBlog})
        }
    })
})

router.put("/:id",function(req,res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err, updatedBlog)
    {
        if(err)
        {
            res.redirect("/blog");
        }
        else
        {
            res.redirect("/blog/"+ req.params.id);
        }
    })
})

router.delete("/:id",function(req,res)
{
    Blog.findByIdAndRemove(req.params.id,function(err)
    {
        if(err)
        {
            res.redirect("/blog");
        }
        else{
            res.redirect("/blog");
        }
    })
})

module.exports = router;


function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated())
  {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/signin');
}