using ProjetoFinancas.Classes;
using Microsoft.AspNetCore.Builder;

var builder = WebApplication.CreateBuilder(args);

// Adiciona serviços ao container
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configura o pipeline HTTP
app.UseHttpsRedirection();
app.UseStaticFiles();

// Inicializa o sistema de persistência
var persistencia = new Persistencia();

// Carrega dados existentes
var utilizadores = new List<Utilizador>();
var transacoes = new List<Transacao>();
var categorias = new List<Categoria>
{
    new Categoria { Id = 1, Nome = "Alimentação", Descricao = "Despesas com alimentação" },
    new Categoria { Id = 2, Nome = "Transporte", Descricao = "Despesas com transporte" },
    new Categoria { Id = 3, Nome = "Moradia", Descricao = "Despesas com moradia" },
    new Categoria { Id = 4, Nome = "Lazer", Descricao = "Despesas com lazer" },
    new Categoria { Id = 5, Nome = "Saúde", Descricao = "Despesas com saúde" }
};

// Carrega transações e utilizadores do ficheiro
_ = Task.Run(async () =>
{
    transacoes.AddRange(await persistencia.CarregarTransacoes());
    utilizadores.AddRange(await persistencia.CarregarUtilizadores());
    var categoriasCarregadas = await persistencia.CarregarCategorias();
    if (categoriasCarregadas.Count > 0)
    {
        categorias.Clear();
        categorias.AddRange(categoriasCarregadas);
    }
    else
    {
        // Guarda as categorias padrão se não existirem
        await persistencia.GuardarCategorias(categorias);
    }
});

// Rota inicial - Redireciona para index.html
app.MapGet("/", context =>
{
    context.Response.Redirect("index.html");
    return Task.CompletedTask;
});

// ============== ROTAS DE UTILIZADOR ==============
app.MapGet("/utilizador", () => Results.Ok(utilizadores));

app.MapPost("/utilizador", async (Utilizador utilizador) =>
{
    utilizador.Id = utilizadores.Count + 1;
    utilizadores.Add(utilizador);
    await persistencia.GuardarUtilizadores(utilizadores);
    return Results.Created($"/utilizador/{utilizador.Id}", utilizador);
});

app.MapGet("/utilizador/{id}", (int id) =>
{
    var utilizador = utilizadores.FirstOrDefault(u => u.Id == id);
    return utilizador != null ? Results.Ok(utilizador) : Results.NotFound();
});

// ============== ROTAS DE TRANSAÇÃO ==============
app.MapGet("/transacoes", () =>
{
    if (transacoes.Count == 0)
        return Results.Ok(new List<Transacao>());
    return Results.Ok(transacoes);
});

app.MapPost("/transacoes", async (Transacao transacao) =>
{
    transacao.Number = transacoes.Count + 1;
    transacoes.Add(transacao);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Created($"/transacoes/{transacao.Number}", transacao);
});

app.MapDelete("/transacoes/{number}", async (int number) =>
{
    var transacao = transacoes.FirstOrDefault(t => t.Number == number);
    if (transacao == null)
        return Results.NotFound();

    transacoes.Remove(transacao);
    await persistencia.GuardarTransacoes(transacoes);
    return Results.Ok();
});

// ============== ROTAS DE CATEGORIA ==============
app.MapGet("/categorias", () => Results.Ok(categorias));

app.MapPost("/categorias", async (Categoria categoria) =>
{
    categoria.Id = categorias.Count + 1;
    categorias.Add(categoria);
    await persistencia.GuardarCategorias(categorias);
    return Results.Created($"/categorias/{categoria.Id}", categoria);
});

app.MapGet("/categorias/{id}", (int id) =>
{
    var categoria = categorias.FirstOrDefault(c => c.Id == id);
    return categoria != null ? Results.Ok(categoria) : Results.NotFound();
});

app.Run();


