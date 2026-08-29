package com.saucelabs.mydemoapp.android.benchmark

import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

private const val TARGET_PACKAGE_NAME = "com.saucelabs.mydemoapp.android"

@RunWith(AndroidJUnit4::class)
class StartupBenchmark {

    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    @Test
    fun coldStartupToCatalog() = benchmarkRule.measureRepeated(
        packageName = TARGET_PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.COLD,
        compilationMode = CompilationMode.Full(),
    ) {
        startActivityAndWait()
    }

    @Test
    fun warmStartupToCatalog() = benchmarkRule.measureRepeated(
        packageName = TARGET_PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        iterations = 10,
        startupMode = StartupMode.WARM,
        compilationMode = CompilationMode.Full(),
    ) {
        startActivityAndWait()
    }
}
