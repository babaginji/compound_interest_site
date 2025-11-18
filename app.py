from flask import Flask, render_template, request, jsonify
from utils.calc import compound_interest_with_history

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    principal = float(data.get("principal", 0))
    annual_rate = float(data.get("annual_rate", 0))
    years = int(data.get("years", 0))
    monthly_addition = float(data.get("monthly_addition", 0))

    total, history = compound_interest_with_history(
        principal, annual_rate, years, monthly_addition
    )
    return jsonify({"result": total, "history": history})


if __name__ == "__main__":
    app.run(debug=True)
