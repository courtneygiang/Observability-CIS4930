const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Jaeger exporter configuration
const jaegerExporter = new JaegerExporter({
    serviceName: "todo-service",
    endpoint: "http://localhost:14268/api/traces",
});

module.exports = (serviceName) => {
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });
   
   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
   
   provider.register();
   
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
           jaegerExporter,  // Add Jaeger exporter to instrumentations
       ],
       tracerProvider: provider,
   });
   
   return trace.getTracer(serviceName);
};
