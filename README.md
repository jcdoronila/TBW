# TBW

Instruction:

    npm install
    run SQL Dump
    create .env (copy from env sample)
      > change password
    run
      > nodemon index.js OR node index.js
      
Starting Pages:

    welcome: http://localhost:3000/welcome
      
Dev Notes:

	res.render('scheduler/views/index', {thisUserTab: req.user});
