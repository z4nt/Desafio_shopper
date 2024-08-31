import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LeituraResposta } from '../db';

export const router = Router();
const API_KEY = process.env.GEMINI_API_KEY || "";
router.post("/upload", async (req, res) => {
  //desestruturação do body da requisição
  const { image, customer_code, measure_datetime, measure_type } = req.body;

  //validação da requisição
  if (image && customer_code && measure_datetime && measure_type) {
    const leituraBanco = await LeituraResposta.findAll({
      where: {
        customer_code: customer_code,
        measure_type: measure_type,
      },
    });

    if (leituraBanco.length > 0) {
      res.status(409).json({
        error_code: "DOUBLE_REPORT",
        error_description: "Leitura do mês já realizada",
      });
    } else {
      // https://github.com/google-gemini/generative-ai-js
      const genAI = new GoogleGenerativeAI(API_KEY || "");
      const model = genAI.getGenerativeModel({
        // Choose a Gemini model.
        model: "gemini-1.5-flash",
      });
      const prompt =
        "Quero apenas o número da leitura de água, e o url da imagem enviada, separados por um espaço"
      const imageParam = {
        inlineData: {
          data: image,
          mimeType: "image/png",
        },
      };
      const result = await model.generateContent([prompt, imageParam]);
      const resposta = result.response.text();
      console.log(resposta)
      const criarNovaLeituraResposta = {
        measure_uuid: uuidv4(),
        customer_code: customer_code,
        resposta: Number(resposta.split(" ")[0]),
        measure_type: measure_type,
        image_url: resposta.split(" ")[1],
      };

      await LeituraResposta.create(criarNovaLeituraResposta);

      res.json({
        image_url: criarNovaLeituraResposta.image_url,
        measure_uuid: criarNovaLeituraResposta.measure_uuid,
        resposta: criarNovaLeituraResposta.resposta,
      });
    }
  } else {
    res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "dados inválidos",
    });
  }
});

router.patch("/confirm", async (req, res) => {
  const { measure_uuid, confirmed_value } = req.body;

  if (typeof confirmed_value !== "number") {
    res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "confirmaçao de valor deve ser um número",
    });
    return
  }

  if (measure_uuid === undefined) {
    res.status(400).json({
      error_code: "INVALID_DATA",
      error_description: "UUID näo pode ser nulo",
    });
    return
  }
  const resultado = await LeituraResposta.findOne({
    where: {
      measure_uuid: measure_uuid,
    },
  });

  console.log(confirmed_value)

  if (resultado === null || resultado === undefined) {
    res.status(404).json({
      "error_code":
        "MEASURE_NOT_FOUND",
      "error_description": "Leitura do mês já realizada"
    })
    return
  }

  if (resultado.get('confirmed_value') === confirmed_value) {
    res.status(409).json(
      {
        "error_code": "CONFIRMATION_DUPLICATE",
        "error_description": "Leitura do mês já realizada"
      }
    )
    return
  }

  await LeituraResposta.update(
    { confirmed_value: confirmed_value },
    { where: { measure_uuid: measure_uuid } }
  );

  res.json()
});
router.get("/:customer_code/list", async (req, res) => {
  const { customer_code } = req.params;
  const { measure_type } = req.query;

  //checa se o customer_code foi informado
  if (customer_code === undefined || customer_code === null) {
    res.status(400).json({
      "error_code": "INVALID_DATA",
      "error_description": "Código do cliente não pode ser nulo"
    });
    return
  } else {
    //se o customer_code foi informado, checa se o tipo de medição foi informado
    if (measure_type === undefined || measure_type === null) {
      const resultado = await LeituraResposta.findAll({
        where: {
          customer_code: customer_code
        }})
        res.status(200).send(resultado)
      return
    }else{
      //se o customer_code e o tipo de medição foram informados checa se existem leituras
      if(measure_type === "WATER" || measure_type === "GAS"){
        const resultado = await LeituraResposta.findAll({
          where: {
            customer_code: customer_code,
            measure_type: measure_type
          }});
        if (resultado.length === 0) {
          res.status(404).json({
            "error_code": "MEASURES_NOT_FOUND",
            "error_description": "Nenhuma leitura encontrada",
          })
          return
        } else {
          res.status(200).json(resultado);
        }
      }else{
        res.status(400).json({
          "error_code": "INVALID_DATA",
          "error_description": "Tipo de medição não permitida"
        });
        return
      }
    }
  }

});

