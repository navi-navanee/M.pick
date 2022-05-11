const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url='mongodb+srv://navaneeth:Navaneeth123@cluster0.yxkez.mongodb.net/project?retryWrites=true&w=majority'
    const dbname='project'

    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })  

}  

module.exports.get=function(){
    return state.db  
}