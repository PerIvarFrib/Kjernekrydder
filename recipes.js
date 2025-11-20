document.addEventListener("DOMContentLoaded", function () {
	const grid = document.querySelector("[data-recipe-grid]");
	const status = document.querySelector("[data-recipe-status]");
	if (!grid || !status) {
		return;
	}

	const recipesUrl = "oppskrifter/recipes.json";

	fetch(recipesUrl, { cache: "no-store" })
		.then(function (response) {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then(function (recipes) {
			if (!Array.isArray(recipes) || recipes.length === 0) {
				status.textContent = "Ingen oppskrifter tilgjengelig akkurat n\u00e5.";
				grid.hidden = true;
				return;
			}

			grid.innerHTML = "";
			recipes.forEach(function (recipe) {
				const card = document.createElement("a");
				card.className = "recipe-card";
				card.href = "oppskrifter/" + encodeURI(recipe.slug) + ".html";

				if (recipe.image) {
					const img = document.createElement("img");
					img.src = recipe.image;
					if (recipe.imageWidth) {
						img.width = recipe.imageWidth;
					}
					if (recipe.imageHeight) {
						img.height = recipe.imageHeight;
					}
					img.loading = "lazy";
					img.alt = recipe.imageAlt || recipe.title || "Oppskrift";
					card.appendChild(img);
				}

				const title = document.createElement("h2");
				title.className = "recipe-card-title";
				title.textContent = recipe.title || "Oppskrift";
				card.appendChild(title);

				if (recipe.description) {
					const desc = document.createElement("p");
					desc.className = "recipe-card-desc";
					desc.textContent = recipe.description;
					card.appendChild(desc);
				}

				grid.appendChild(card);
			});

			grid.hidden = false;
			status.hidden = true;
		})
		.catch(function () {
			status.hidden = false;
			status.textContent = "Kunne ikke laste oppskrifter akkurat n\u00e5. Oppdater siden eller fors\u00f8k igjen senere.";
			grid.hidden = true;
		});
});
