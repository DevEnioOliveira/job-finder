const express = require('express');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser')
const path = require('path')

const app = express();
const {request, response} = require('express')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

const port = process.env.PORT || 3000;

 const connection = sqlite.open({filename: './database/database.sqlite', driver: sqlite3.Database })


//ROUTES

const init = async() => {
    try{
       // (await connection).run('CREATE TABLE IF NOT EXISTS categorias(id INTEGER PRIMARY KEY, categoria_nome TEXT); ')
    }catch(e) {
        console.log(e)
    }
}

init();

//ROUTES HOME
app.get('/', async(request,response)=>{
    const db = await connection;
    const categoriasDB = await db.all('select * from categorias')
    const vagasDB = await db.all('select * from vagas')
    const categorias = categoriasDB.map(category => {
        return {
            ...category,
            vagas: vagasDB.filter(vaga => vaga.categoria_nome === category.id)
        }
    })
    response.render('home', {
        categorias
    })
})


//ROUTE VAGA
app.get('/vaga/:id', async(request,response) => {
    const db = await connection;
    const vaga = await db.get('select * from vagas where id='+request.params.id);
    
    response.render('vaga', {
        vaga
    })
})


app.get('/admin', async(request,response) => {
    response.render('admin/admin',{})
})

//ROUTES VAGAS

app.get('/admin/vagas', async(request,response) => {
    const db = await connection;
    const categoriasDB = await db.all('select * from categorias')
    const vagasDB = await db.all('select * from vagas')
    const categorias = categoriasDB.map(category => {
        return {
            ...category,
            vagas: vagasDB.filter(vaga => vaga.categoria_nome === category.id)
        }
    })
    response.render('admin/admin-vagas', {
        categorias
    })
})

app.get('/admin/vagas/nova' , async(request,response) => {
    const db = await connection;
    const categorias = await db.all('select * from categorias')
    response.render('admin/nova-vaga', {
        categorias
    })
})

app.post('/admin/vagas/nova', async(request,response) => {
    const {categoria_nome, titulo, descricao} =  request.body
    const db = await connection;
    await db.run(`INSERT INTO VAGAS(categoria_nome,titulo,descricao) VALUES(${categoria_nome}, '${titulo}', '${descricao}');`)
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/delete/:id' , async(request,response) => {
    const db = await connection;
    await db.run('delete from vagas where id = ' + request.params.id) 
    response.redirect('/admin/vagas')
})

app.get('/admin/vagas/editar/:id' , async(request,response) => {
    const db = await connection;
    const categorias = await db.all('select * from categorias');
    const vaga = await db.get('select * from vagas where id = ' +  request.params.id)

    response.render('admin/editar-vaga', {categorias, vaga} )
})

app.post('/admin/vagas/editar/:id' , async(request,response) => {
    const {categoria_nome,titulo,descricao} = request.body
    const db = await connection;
    

    await db.run(`UPDATE vagas SET categoria_nome = ${categoria_nome}, titulo = '${titulo}' , descricao = '${descricao}';`)

    response.redirect('/admin/vagas')
})

//ROUTES CATEGORIES

app.get('/admin/categorias', async(request,response) => {
    const db = await connection;
    const categorias = await db.all('select * from categorias');
    response.render('admin/admin-categorias', {
        categorias
    })
})

app.get('/admin/categorias/nova', async(request,response) => {
    const db = await connection
    const categorias = await db.all('select categoria_nome from categorias')
    response.render('admin/nova-categoria', { categorias })
})



app.get('/admin/categorias/delete/:id' , async(request,response) => {
    const db = await connection;
    await db.run('delete from categorias where id = ' + request.params.id) 
    response.redirect('/admin/categorias')
})

app.post('/admin/categorias/nova', async(request,response) => {
    const categoria = request.body.categoria_nome
    const db = await connection
    await db.run(`INSERT INTO categorias(categoria_nome) VALUES('${categoria}')`)
    response.redirect('/admin/categorias')
})

app.listen(port,(err) => {
    if(err) {
        console.log('Não foi possivel iniciar o servidor')
    } else {
        console.log('Servidor rodando na porta' + port)
    }
})
