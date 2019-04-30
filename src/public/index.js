import style from './style.css'
class token{
    constructor(name, age){
        this.name = name
        this.age = age
    }

    get(){
         return this
    }
}
var to = new token('cnzmg',19);
console.log(to.get());
